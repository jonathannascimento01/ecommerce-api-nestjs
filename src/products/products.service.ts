import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from './gemini.service';
import * as XLSX from 'xlsx';

const GIFT_WRAP_PRICES: Record<string, { label: string; price: number }> = {
  'Sacola de Presente P com Laço (1 unidade)': {
    label: 'Sacola de Presente P com Laço (1 unidade)',
    price: 6.9,
  },
  'Sacola de Presente M com Laço (1 unidade)': {
    label: 'Sacola de Presente M com Laço (1 unidade)',
    price: 9.9,
  },
  'Sacola de Presente G com Laço': {
    label: 'Sacola de Presente G com Laço',
    price: 12.9,
  },
  'Caixa Especial de Presente Premium': {
    label: 'Caixa Especial de Presente Premium',
    price: 13.9,
  },
};

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
        tbl_product_images: {
          orderBy: { sort_order: 'asc' },
        },
      },
      orderBy: {
        product_name: 'asc',
      },
    });
  }

  async findAllAdmin() {
    return await this.prisma.tbl_products.findMany({
      include: {
        tbl_brands: true,
        tbl_categories: true,
        tbl_stock: true,
        tbl_product_images: {
          orderBy: { sort_order: 'asc' },
        },
      },
      orderBy: {
        product_name: 'asc',
      },
    });
  }

  async createCheckout(payload: {
    customerEmail?: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    giftOption?: { label: string; price: number } | null;
    cardMessage?: string | null;
    items: Array<{ product_id: number; quantity: number; price: number }>;
  }) {
    try {
      const {
        customerEmail: rawEmail,
        customerName,
        customerPhone,
        customerAddress,
        giftOption,
        cardMessage,
        items,
      } = payload;

      if (!items || items.length === 0) {
        return { success: false, message: 'O carrinho está vazio.' };
      }

      let validatedGift: { label: string; price: number } | null = null;
      if (giftOption && giftOption.label) {
        const matchedGift = GIFT_WRAP_PRICES[giftOption.label.trim()];
        if (matchedGift) {
          validatedGift = matchedGift;
        }
      }

      const giftAmount = validatedGift ? validatedGift.price : 0;
      const cleanCardMessage = cardMessage?.trim() || '';

      const result = await this.prisma.$transaction(async (tx) => {
        const cleanPhone = customerPhone.replace(/\D/g, '') || String(Date.now());
        const customerEmail =
          rawEmail?.trim().toLowerCase() || `cliente_${cleanPhone}@kezamstore.local`;

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
        } else if (customer.full_name !== customerName || customer.phone !== customerPhone) {
          customer = await tx.tbl_customers.update({
            where: { customer_id: customer.customer_id },
            data: {
              full_name: customerName,
              phone: customerPhone,
            },
          });
        }

        let subtotalAmount = 0;
        const orderItemsData: Array<{
          product_id: bigint;
          sku: string;
          product_name: string;
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
            sku: product.sku,
            product_name: product.product_name,
            quantity: item.quantity,
            unit_price: unitPrice,
            subtotal: itemSubtotal,
          });
        }

        const finalTotalAmount = Number((subtotalAmount + giftAmount).toFixed(2));
        const orderNumber = `KZ-${Date.now().toString().slice(-6)}`;

        await tx.tbl_orders.create({
          data: {
            customer_id: customer.customer_id,
            order_number: orderNumber,
            customer_address: customerAddress?.trim() || 'Não informado',
            subtotal_amount: subtotalAmount,
            discount_amount: 0,
            shipping_amount: giftAmount,
            total_amount: finalTotalAmount,
            status: 'PENDENTE',
            tbl_order_items: {
              create: orderItemsData.map((i) => ({
                product_id: i.product_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                subtotal: i.subtotal,
              })),
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

        return {
          orderNumber,
          subtotalAmount,
          giftAmount,
          totalAmount: finalTotalAmount,
          orderItemsData,
        };
      });

      const itemsText = result.orderItemsData
        .map(
          (i) =>
            `- ${i.quantity}x ${i.product_name} (Cód. ${i.sku}) - R$ ${i.subtotal
              .toFixed(2)
              .replace('.', ',')}`,
        )
        .join('\n');

      const giftText = validatedGift
        ? `\n- 1x ${validatedGift.label} - R$ ${validatedGift.price
            .toFixed(2)
            .replace('.', ',')}`
        : '';

      const cardText = cleanCardMessage
        ? `\n*Cartão de Presente*: "${cleanCardMessage}"`
        : '';

      const addressText = customerAddress?.trim()
        ? `\n*Endereço*: ${customerAddress.trim()}`
        : '';

      const whatsappMsg =
        `*NOVO PEDIDO - KEZAM STORE*\n\n` +
        `*Pedido*: #${result.orderNumber}\n` +
        `*Cliente*: ${customerName}\n` +
        `*Contato*: ${customerPhone}` +
        `${addressText}${cardText}\n\n` +
        `*Itens do Pedido*:\n${itemsText}${giftText}\n\n` +
        `*Total*: R$ ${result.totalAmount.toFixed(2).replace('.', ',')}`;

      const targets = [
        { phone: '558197422792', apiKey: '7693734' },
        { phone: '5511995449855', apiKey: 'SUA_APIKEY_NUMERO_2' },
      ];

      for (const target of targets) {
        if (target.apiKey && !target.apiKey.startsWith('SUA_')) {
          const url = `https://api.callmebot.com/whatsapp.php?phone=${target.phone}&text=${encodeURIComponent(
            whatsappMsg,
          )}&apikey=${target.apiKey}`;
          fetch(url).catch((err) =>
            console.error(`Falha ao notificar WhatsApp (${target.phone}):`, err),
          );
        }
      }

      return {
        success: true,
        message: `Pedido #${result.orderNumber} realizado com sucesso! Total: R$ ${result.totalAmount
          .toFixed(2)
          .replace('.', ',')}`,
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

  async updateOrderStatus(orderId: number, status: string, reason?: string) {
    try {
      const id = BigInt(orderId);

      const currentOrder = await this.prisma.tbl_orders.findUnique({
        where: { order_id: id },
        include: { tbl_order_items: true },
      });

      if (!currentOrder) {
        return { success: false, message: 'Pedido não encontrado.' };
      }

      if (status === 'CANCELADO' && (!reason || !reason.trim())) {
        return {
          success: false,
          message: 'É obrigatório informar a justificativa do cancelamento.',
        };
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.tbl_orders.update({
          where: { order_id: id },
          data: {
            status,
            cancellation_reason: status === 'CANCELADO' ? reason!.trim() : null,
          },
        });

        if (status === 'CANCELADO' && currentOrder.status !== 'CANCELADO') {
          for (const item of currentOrder.tbl_order_items) {
            await tx.tbl_stock.update({
              where: { product_id: item.product_id },
              data: {
                quantity: { increment: item.quantity },
                updated_at: new Date(),
              },
            });

            await tx.tbl_stock_movements.create({
              data: {
                product_id: item.product_id,
                movement_type: 'ENTRADA',
                quantity: item.quantity,
                reason: `Estorno Cancelamento Pedido #${currentOrder.order_number}`,
              },
            });
          }
        }
      });

      return {
        success: true,
        message:
          status === 'CANCELADO'
            ? `Pedido #${currentOrder.order_number} cancelado e movido para o Histórico (estoque estornado).`
            : `Status do pedido #${currentOrder.order_number} atualizado para ${status}.`,
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

  async saveProductImage(productId: number, imageUrl: string) {
    try {
      const prodId = BigInt(productId);
      const cleanUrl = imageUrl.trim();

      if (!cleanUrl) {
        return { success: false, message: 'Informe uma URL de imagem válida.' };
      }

      const existingImage = await this.prisma.tbl_product_images.findFirst({
        where: { product_id: prodId, sort_order: 1 },
      });

      if (existingImage) {
        await this.prisma.tbl_product_images.update({
          where: { image_id: existingImage.image_id },
          data: { image_url: cleanUrl },
        });
      } else {
        await this.prisma.tbl_product_images.create({
          data: {
            product_id: prodId,
            image_url: cleanUrl,
            sort_order: 1,
          },
        });
      }

      return {
        success: true,
        message: 'Imagem do produto salva com sucesso!',
      };
    } catch (error: any) {
      return { success: false, message: `Erro ao salvar imagem: ${error.message}` };
    }
  }

  async updateProductDescription(productId: number, description: string) {
    try {
      const prodId = BigInt(productId);
      const cleanDesc = description.trim();

      if (!cleanDesc) {
        return { success: false, message: 'A descrição não pode ficar vazia.' };
      }

      await this.prisma.tbl_products.update({
        where: { product_id: prodId },
        data: { description: cleanDesc },
      });

      return {
        success: true,
        message: 'Descrição do produto atualizada com sucesso!',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao atualizar descrição: ${error.message}`,
      };
    }
  }

  async updateProductDetails(
    productId: number,
    payload: {
      product_name?: string;
      price?: number;
      brand_name?: string;
      category_name?: string;
      active?: boolean;
    },
  ) {
    try {
      const prodId = BigInt(productId);
      const dataToUpdate: any = {};

      if (payload.product_name !== undefined && payload.product_name.trim()) {
        dataToUpdate.product_name = payload.product_name.trim();
      }

      if (
        payload.price !== undefined &&
        !isNaN(Number(payload.price)) &&
        Number(payload.price) > 0
      ) {
        dataToUpdate.price = Number(payload.price);
      }

      if (typeof payload.active === 'boolean') {
        dataToUpdate.active = payload.active;
      }

      if (payload.brand_name && payload.brand_name.trim()) {
        const cleanBrand = payload.brand_name.trim();
        let brand = await this.prisma.tbl_brands.findUnique({
          where: { brand_name: cleanBrand },
        });
        if (!brand) {
          brand = await this.prisma.tbl_brands.create({
            data: { brand_name: cleanBrand },
          });
        }
        dataToUpdate.brand_id = brand.brand_id;
      }

      if (payload.category_name && payload.category_name.trim()) {
        const cleanCat = payload.category_name.trim();
        let category = await this.prisma.tbl_categories.findUnique({
          where: { category_name: cleanCat },
        });
        if (!category) {
          category = await this.prisma.tbl_categories.create({
            data: { category_name: cleanCat },
          });
        }
        dataToUpdate.category_id = category.category_id;
      }

      await this.prisma.tbl_products.update({
        where: { product_id: prodId },
        data: dataToUpdate,
      });

      return {
        success: true,
        message: 'Dados do produto atualizados com sucesso!',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao atualizar produto: ${error.message}`,
      };
    }
  }

  private detectBrandAndCategory(productName: string): {
    brandName: string;
    categoryName: string;
  } {
    const norm = productName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    let brandName = 'Natura';
    if (
      norm.includes('boticario') ||
      norm.includes('malbec') ||
      norm.includes('lily') ||
      norm.includes('floratta') ||
      norm.includes('egeo') ||
      norm.includes('glamour') ||
      norm.includes('coffee') ||
      norm.includes('quasar') ||
      norm.includes('nativa spa') ||
      norm.includes('cuide-se bem')
    ) {
      brandName = 'O Boticário';
    } else if (
      norm.includes('eudora') ||
      norm.includes('siage') ||
      norm.includes('niina') ||
      norm.includes('aura')
    ) {
      brandName = 'Eudora';
    } else if (
      norm.includes('avon') ||
      norm.includes('far away') ||
      norm.includes('renew') ||
      norm.includes('color trend')
    ) {
      brandName = 'Avon';
    }

    let categoryName = 'Perfumaria e Cosméticos';
    if (
      [
        'batom',
        'gloss',
        'maquiagem',
        'base',
        'rimel',
        'blush',
        'sombra',
        'delineador',
        'corretivo',
        'esmalte',
      ].some((k) => norm.includes(k))
    ) {
      categoryName = 'Maquiagem';
    } else if (
      [
        'hidratante',
        'locao',
        'creme corporal',
        'creme para maos',
        'oleo corporal',
        'nativa spa',
        'tododia',
      ].some((k) => norm.includes(k))
    ) {
      categoryName = 'Hidratante';
    } else if (
      [
        'cabelo',
        'shampoo',
        'condicionador',
        'capilar',
        'creme para pentear',
        'leave-in',
        'siage',
      ].some((k) => norm.includes(k))
    ) {
      categoryName = 'Cabelo';
    } else if (
      [
        'limpeza',
        'sabonete',
        'esfoliante',
        'demaquilante',
        'agua micelar',
        'desodorante roll',
      ].some((k) => norm.includes(k))
    ) {
      categoryName = 'Limpeza';
    } else if (
      [
        'perfume',
        'colonia',
        'parfum',
        'body splash',
        'splash',
        'essencial',
        'kaiak',
        'malbec',
        'lily',
        'floratta',
        'egeo',
        'luna',
        'ilia',
        'far away',
      ].some((k) => norm.includes(k))
    ) {
      categoryName = 'Perfume';
    }

    return { brandName, categoryName };
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

        const { brandName, categoryName } = this.detectBrandAndCategory(productName);

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

        const existingProduct = await this.prisma.tbl_products.findFirst({
          where: { sku: String(sku) },
        });

        if (!existingProduct) {
          let description = `Produto oficial ${brandName} ${productName}.`;
          try {
            const aiDesc = await this.geminiService.generateProductDescription(
              productName,
              categoryName,
            );
            if (aiDesc) description = aiDesc;
          } catch {
            // Mantém fallback se a API falhar
          }

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
          let descriptionToKeep = existingProduct.description;
          if (!descriptionToKeep || !descriptionToKeep.trim()) {
            try {
              const aiDesc = await this.geminiService.generateProductDescription(
                productName,
                categoryName,
              );
              descriptionToKeep = aiDesc || `Produto oficial ${brandName} ${productName}.`;
            } catch {
              descriptionToKeep = `Produto oficial ${brandName} ${productName}.`;
            }
          }

          await this.prisma.tbl_products.update({
            where: { product_id: existingProduct.product_id },
            data: {
              product_name: productName,
              price: price,
              description: descriptionToKeep,
              category_id: category.category_id,
              brand_id: brand.brand_id,
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