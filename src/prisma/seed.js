const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('A inserir os produtos da nota fiscal...');

  // Aqui pode colocar os dados dos 14 produtos extraídos da nota fiscal
  // Exemplo de estrutura para os produtos:
  const produtos = [
    // Substitua ou adicione os 14 produtos aqui conforme necessário
    { name: 'Produto 1 da Nota', price: 10.00, stock: 10 },
  ];

  for (const produto of produtos) {
    await prisma.product.create({
      data: produto,
    });
  }

  console.log('✅ Todos os produtos da nota fiscal foram inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });