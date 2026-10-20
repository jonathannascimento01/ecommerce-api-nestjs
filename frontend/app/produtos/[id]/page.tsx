import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

// Permite a rota de dados dinâmicos no Next.js 16
export const instant = false;

interface Product {
  product_id: string | number;
  product_name: string;
  description?: string;
  price: number | string;
  sku?: string;
  tbl_product_images?: Array<{ image_url: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:4000/products/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Produto não encontrado</h2>
        <p className="text-gray-500 mb-6">O produto que procura não existe ou foi removido.</p>
        <Link
          href="/"
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-sm"
        >
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const imageUrl =
    product.tbl_product_images && product.tbl_product_images.length > 0
      ? product.tbl_product_images[0].image_url
      : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=60';

  const formattedPrice = Number(product.price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 w-fit"
        >
          ← Voltar para o Catálogo
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-10">
        {/* Imagem do Produto */}
        <div className="relative w-full h-[400px] md:h-[500px] bg-gray-50 rounded-2xl overflow-hidden shadow-inner">
          <Image
            src={imageUrl}
            alt={product.product_name}
            fill
            className="object-cover object-center"
            priority
          />
          {product.sku && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-xs">
              SKU: {product.sku}
            </div>
          )}
        </div>

        {/* Informações e Ações */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full">
              Natura & Avon
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 leading-snug">
              {product.product_name}
            </h1>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">{formattedPrice}</span>
              <span className="text-xs text-gray-400">Em stock</span>
            </div>

            <div className="my-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Descrição do Produto</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {product.description || 'Produto de alta qualidade selecionado especialmente para si.'}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}