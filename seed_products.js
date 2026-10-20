const axios = require('axios');

const products = [
  { "product_name": "ILIA CLASSICO DEO PARFUM FEM 50ML NV", "sku": "54522", "price": 285.42, "description": "Produto Natura/Avon - Código 54522", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "TODODIA DES CREME SEM PERFUME INVIS 80G", "sku": "96515", "price": 33.22, "description": "Produto Natura/Avon - Código 96515", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "TODODIA DES SPRAY PERF AMEIXA BAUN 200ML", "sku": "100679", "price": 203.5, "description": "Produto Natura/Avon - Código 100679", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "TODODIA HID DES CORP NOTUR  400ML", "sku": "121970", "price": 131.76, "description": "Produto Natura/Avon - Código 121970", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "ESSENCIAL DEO PARF ATRAI FEM 100ML", "sku": "165813", "price": 228.36, "description": "Produto Natura/Avon - Código 165813", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "TODODIA DES BD SPLASH CEREJA NEGRA 200ML", "sku": "174618", "price": 203.5, "description": "Produto Natura/Avon - Código 174618", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "QUILAO1 4T 2024", "sku": "176182", "price": 156.24, "description": "Produto Natura/Avon - Código 176182", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "AURA DES HID CORP AURA ALBA 200G", "sku": "180310", "price": 101.93, "description": "Produto Natura/Avon - Código 180310", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "UNA SOMBRA COMP PRO NUDE 2C 7G TERC", "sku": "205934", "price": 190.26, "description": "Produto Natura/Avon - Código 205934", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "FACES BATOM MULTIMIX CREM COR 2 3,5G", "sku": "216439", "price": 14.21, "description": "Produto Natura/Avon - Código 216439", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "KAIAK SH CABCORP PULSO 200ML", "sku": "225272", "price": 47.46, "description": "Produto Natura/Avon - Código 225272", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "KAIAK DES COL 21K M 100ML", "sku": "228528", "price": 506.52, "description": "Produto Natura/Avon - Código 228528", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "TDDIA DES BODY SPLA CARM SAL F 200ML", "sku": "237761", "price": 91.8, "description": "Produto Natura/Avon - Código 237761", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "KAIAK DES HID CORP PROV 100G", "sku": "247692", "price": 54.26, "description": "Produto Natura/Avon - Código 247692", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "LUMINA ANTIOLEO COND REG + 9 90 REF", "sku": "262775", "price": 47.46, "description": "Produto Natura/Avon - Código 262775", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "LUMINA ANTIOLEO SH REG + 9 90 REF", "sku": "262778", "price": 45.42, "description": "Produto Natura/Avon - Código 262778", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "TODODIA QUILAO 3T PLB", "sku": "291189", "price": 156.24, "description": "Produto Natura/Avon - Código 291189", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "EKOS AMO D PARF BAUNILHA F 3X1ML TERC", "sku": "249127", "price": 0.0, "description": "Produto Natura/Avon - Código 249127", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "AURA AMO EDP AURA ALBA BD F 3X1ML TERC", "sku": "259656", "price": 0.0, "description": "Produto Natura/Avon - Código 259656", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "REVISTA BELEZA C16 2026 BRASIL V1", "sku": "280568", "price": 0.0, "description": "Produto Natura/Avon - Código 280568", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "REV ESP NATURA C16 2026 BR EXTO NENO V1", "sku": "280571", "price": 0.0, "description": "Produto Natura/Avon - Código 280571", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "SACOLA MINI PACK 3", "sku": "161147", "price": 0.0, "description": "Produto Natura/Avon - Código 161147", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "SACOLA P PACK 3", "sku": "161149", "price": 0.0, "description": "Produto Natura/Avon - Código 161149", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "SACOLA PRESENTE P MAES 2026", "sku": "222177", "price": 0.0, "description": "Produto Natura/Avon - Código 222177", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "TODODIA CJ LISOS SH COND SPRAY", "sku": "261234", "price": 0.0, "description": "Produto Natura/Avon - Código 261234", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "KAIAK AMO DES COL PROV M 3X1ML TERC", "sku": "240877", "price": 0.0, "description": "Produto Natura/Avon - Código 240877", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "CHRONOS AMO SABLIQ OLEOS 1G TERC", "sku": "253367", "price": 0.0, "description": "Produto Natura/Avon - Código 253367", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "COLOR TREND MASCARA MEGA BFF PRETO", "sku": "135274", "price": 19.49, "description": "Produto Natura/Avon - Código 135274", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "ESCOVA DE DENTE SPIDEY", "sku": "237875", "price": 11.89, "description": "Produto Natura/Avon - Código 237875", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "AVON GLOSS ALICE SHADE 2 6.5ML IMP", "sku": "244327", "price": 61.74, "description": "Produto Natura/Avon - Código 244327", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "AVON GLOSS ALICE SHADE 1 6.5ML IMP", "sku": "244338", "price": 61.74, "description": "Produto Natura/Avon - Código 244338", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "CANECA 2 EM 1 SPIDEY 400ML", "sku": "246352", "price": 17.0, "description": "Produto Natura/Avon - Código 246352", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "KIT TALHER CURVO SPIDEY", "sku": "248221", "price": 18.69, "description": "Produto Natura/Avon - Código 248221", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "MEIA MINNIE 23 27", "sku": "250330", "price": 15.29, "description": "Produto Natura/Avon - Código 250330", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "POWERSTAY BATOM MARROM BRILHANTE 4ML", "sku": "251560", "price": 30.87, "description": "Produto Natura/Avon - Código 251560", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "ESCOVA DE CABELO OVAL OLAF", "sku": "253771", "price": 25.49, "description": "Produto Natura/Avon - Código 253771", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "CE KIT COLECAO FLOW ESSENCIAIS", "sku": "262134", "price": 84.98, "description": "Produto Natura/Avon - Código 262134", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "AVON DES WONDERLAND F 200ML", "sku": "262462", "price": 45.44, "description": "Produto Natura/Avon - Código 262462", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "KIT MARMITA E KIT TALHER FROZEN", "sku": "266529", "price": 33.99, "description": "Produto Natura/Avon - Código 266529", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "KAIAK AMO DES COL 21K F 3X1ML TERC", "sku": "240878", "price": 0.0, "description": "Produto Natura/Avon - Código 240878", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
  { "product_name": "COPO DECORADO C6 MAES 26", "sku": "250370", "price": 0.0, "description": "Produto Natura/Avon - Código 250370", "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" }
];

async function seed() {
  console.log(`A iniciar cadastro de ${products.length} produtos...`);
  
  // Tenta detetar automaticamente se a rota é /products ou /product
  let endpoint = 'http://localhost:4000/products';
  try {
    await axios.get('http://localhost:4000/products');
  } catch (err) {
    if (err.response && err.response.status === 404) {
      endpoint = 'http://localhost:4000/product';
    }
  }

  for (const p of products) {
    try {
      const res = await axios.post(endpoint, p);
      console.log(`[Sucesso] Criado: ${p.product_name} (SKU: ${p.sku}) - R$ ${p.price}`);
    } catch (err) {
      console.error(`[Erro] Ao criar ${p.product_name}:`, err.response?.data || err.message);
    }
  }
  console.log('Processo de sementeira concluído!');
}

seed();