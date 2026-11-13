import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from './gemini.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  async findAll() {
    return await this.prisma.tbl_products.findMany({
      where: { active: true },
      include: {
        tbl_brands: true,
        tbl_categories: true,
        tbl_stock: true,
      },
      orderBy: {
        product_name: 'asc',
      },
    });
  }

  async createCheckout(payload: {
    customerName: string;
    customerPhone: string;
    items: Array<{ product_id: number; quantity: number; price: number }>;
  }) {
    try {
      const { customerName, customerPhone, items } = payload;

      if (!items || items.length === 0) {
        return { success: false, message: 'O carrinho está vazio.' };
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const cleanPhone = customerPhone.replace(/\D/g, '') || String(Date.now());
        const customerEmail = `cliente_${cleanPhone}@kezamstore.local`;

        let customer = await tx.tbl_customers.findUnique({
          where: { email: customerEmail },
        });

        if (!customer) {
          customer = await tx.tbl_customers.create({
            data: {
              full_name: customerName,
              email: customerEmail,
              phone: customerPhone,
              password_hash: 'checkout_rapido',
              active: true,
            },
          });
        }

        let subtotalAmount = 0;
        const orderItemsData: Array<{
          product_id: bigint;
          quantity: number;
          unit_price: number;
          subtotal: number;
        }> = [];

        for (const item of items) {
          const prodId = BigInt(item.product_id);
          const product = await tx.tbl_products.findUnique({
            where: { product_id: prodId },
            include: { tbl_stock: true },
          });

          if (!product) {
            throw new Error(`Produto ID ${item.product_id} não encontrado.`);
          }

          const currentStock = product.tbl_stock?.quantity ?? 0;
          if (currentStock < item.quantity) {
            throw new Error(
              `Estoque insuficiente para "${product.product_name}" (disponível: ${currentStock} un.).`,
            );
          }

          const unitPrice = Number(product.price);
          const itemSubtotal = unitPrice * item.quantity;
          subtotalAmount += itemSubtotal;

          orderItemsData.push({
            product_id: prodId,
            quantity: item.quantity,
            unit_price: unitPrice,
            subtotal: itemSubtotal,
          });
        }

        const orderNumber = `KZ-${Date.now().toString().slice(-6)}`;
        await tx.tbl_orders.create({
          data: {
            customer_id: customer.customer_id,
            order_number: orderNumber,
            subtotal_amount: subtotalAmount,
            discount_amount: 0,
            shipping_amount: 0,
            total_amount: subtotalAmount,
            status: 'PENDENTE',
            tbl_order_items: {
              create: orderItemsData,
            },
          },
        });

        for (const item of orderItemsData) {
          await tx.tbl_stock.update({
            where: { product_id: item.product_id },
            data: {
              quantity: { decrement: item.quantity },
              updated_at: new Date(),
            },
          });

          await tx.tbl_stock_movements.create({
            data: {
              product_id: item.product_id,
              movement_type: 'SAIDA',
              quantity: item.quantity,
              reason: `Venda Pedido #${orderNumber}`,
            },
          });
        }

        return { orderNumber, totalAmount: subtotalAmount };
      });

      return {
        success: true,
        message: `Pedido #${result.orderNumber} realizado com sucesso! Total: R$ ${result.totalAmount.toFixed(2).replace('.', ',')}`,
        orderNumber: result.orderNumber,
      };
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      return {
        success: false,
        message: error.message || 'Erro ao processar o pedido.',
      };
    }
  }

  async findAllOrders() {
    return await this.prisma.tbl_orders.findMany({
      include: {
        tbl_customers: true,
        tbl_order_items: {
          include: {
            tbl_products: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateOrderStatus(orderId: number, status: string) {
    try {
      const id = BigInt(orderId);
      const updated = await this.prisma.tbl_orders.update({
        where: { order_id: id },
        data: { status },
      });
      return {
        success: true,
        message: `Status do pedido #${updated.order_number} atualizado para ${status}.`,
      };
    } catch (error: any) {
      return { success: false, message: `Erro ao atualizar pedido: ${error.message}` };
    }
  }

  async updateStock(productId: number, quantityToAdd: number) {
    try {
      const prodId = BigInt(productId);
      const qty = Number(quantityToAdd);

      if (isNaN(qty) || qty === 0) {
        return { success: false, message: 'Informe uma quantidade válida diferente de zero.' };
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.tbl_stock.upsert({
          where: { product_id: prodId },
          update: {
            quantity: { increment: qty },
            updated_at: new Date(),
          },
          create: {
            product_id: prodId,
            quantity: Math.max(0, qty),
          },
        });

        await tx.tbl_stock_movements.create({
          data: {
            product_id: prodId,
            movement_type: qty > 0 ? 'ENTRADA' : 'AJUSTE_SAIDA',
            quantity: Math.abs(qty),
            reason: 'Ajuste manual via Painel Administrativo',
          },
        });
      });

      return {
        success: true,
        message: `Estoque atualizado com sucesso (${qty > 0 ? '+' : ''}${qty} un.).`,
      };
    } catch (error: any) {
      return { success: false, message: `Erro ao ajustar estoque: ${error.message}` };
    }
  }

  async importFromExcel(fileBuffer: Buffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!rows || rows.length === 0) {
        return { success: false, message: 'A planilha está vazia ou mal formatada.' };
      }

      let processedCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const cells = row.map((c) => String(c ?? '').trim());

        if (cells.some((c) => ['PRODUTO', 'CÓDIGO', 'CODIGO'].includes(c.toUpperCase()))) {
          continue;
        }

        const sku = cells[0];
        const productName = cells[1];

        if (!/^\d{3,8}$/.test(sku) || !productName || productName.length < 3) {
          continue;
        }

        let price = 0;
        let stockQty = 10;

        for (let c = 2; c < cells.length; c++) {
          const val = cells[c];
          if (!val || val === '-') continue;

          let cleanStr = val.replace(/R\$/gi, '').trim();
          if (cleanStr.includes(',')) {
            cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
          }
          const parsed = parseFloat(cleanStr);

          if (!isNaN(parsed) && parsed > 0 && parsed < 10000) {
            if (cells.length > 3 && c === 2 && Number.isInteger(parsed) && parsed < 100) {
              stockQty = parsed;
            } else {
              price = parsed;
            }
          }
        }

        if (price <= 0) continue;

        const categoryName = 'Perfumaria e Cosméticos';
        const brandName = productName.toUpperCase().includes('AVON') ? 'Avon' : 'Natura';

        let category = await this.prisma.tbl_categories.findUnique({
          where: { category_name: categoryName },
        });
        if (!category) {
          category = await this.prisma.tbl_categories.create({
            data: { category_name: categoryName },
          });
        }

        let brand = await this.prisma.tbl_brands.findUnique({
          where: { brand_name: brandName },
        });
        if (!brand) {
          brand = await this.prisma.tbl_brands.create({
            data: { brand_name: brandName },
          });
        }

        let description = `Produto oficial ${brandName} - ${productName}.`;
        try {
          const aiDesc = await this.geminiService.generateProductDescription(productName, categoryName);
          if (aiDesc) description = aiDesc;
        } catch {
          // Mantém fallback se a API falhar
        }

        const existingProduct = await this.prisma.tbl_products.findFirst({
          where: { sku: String(sku) },
        });

        if (!existingProduct) {
          const newProduct = await this.prisma.tbl_products.create({
            data: {
              product_name: productName,
              sku: String(sku),
              price: price,
              description: description,
              category_id: category.category_id,
              brand_id: brand.brand_id,
              active: true,
            },
          });

          await this.prisma.tbl_stock.create({
            data: {
              product_id: newProduct.product_id,
              quantity: stockQty,
            },
          });
        } else {
          await this.prisma.tbl_products.update({
            where: { product_id: existingProduct.product_id },
            data: {
              product_name: productName,
              price: price,
              description: description,
            },
          });
        }

        processedCount++;
      }

      return {
        success: true,
        message: `${processedCount} produtos importados/atualizados com sucesso para a Kezam Store!`,
      };
    } catch (error: any) {
      console.error('Erro ao importar planilha:', error);
      return { success: false, message: `Erro ao processar ficheiro: ${error.message}` };
    }
  }
}