import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

interface Product {
  product_id: number | string;
  product_name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  sku?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:4000/products/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    return null;
  }
}

export default async function ProductDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
        <Link href="/" className="text-indigo-600 hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 p-8">
        <div className="mb-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
            ← Voltar para a loja
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.product_name}
                className="w-full h-80 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                Sem imagem disponível
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{product.product_name}</h1>
              {product.sku && (
                <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
              )}
              <p className="text-3xl font-bold text-indigo-600 mt-4">
                R$ {Number(product.price).toFixed(2)}
              </p>
              <p className="text-gray-600 mt-4 leading-relaxed">
                {product.description || 'Nenhuma descrição detalhada fornecida para este produto.'}
              </p>
            </div>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}