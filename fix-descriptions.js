const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.tbl_products.findMany({
    where: {
      description: { contains: 'Masculino', mode: 'insensitive' },
    },
  });

  let updated = 0;

  for (const p of products) {
    const name = p.product_name.toLowerCase();
    const isFeminine =
      name.includes('feminino') ||
      name.includes(' fem ') ||
      name.endsWith(' fem') ||
      name.includes('lily') ||
      name.includes('floratta') ||
      name.includes('luna') ||
      name.includes('ilia') ||
      name.includes('ilía') ||
      name.includes('essencial exclusivo floral') ||
      name.includes('kriska') ||
      name.includes('biografia feminino');

    if (isFeminine && p.description) {
      const fixedDescription = p.description
        .replace(/O Perfume Masculino/gi, 'O Perfume Feminino')
        .replace(/Perfume Masculino/gi, 'Perfume Feminino');

      await prisma.tbl_products.update({
        where: { product_id: p.product_id },
        data: { description: fixedDescription },
      });
      updated++;
      console.log(`Corrigido: [${p.sku}] ${p.product_name}`);
    }
  }

  console.log(`\nTotal de produtos atualizados: ${updated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());