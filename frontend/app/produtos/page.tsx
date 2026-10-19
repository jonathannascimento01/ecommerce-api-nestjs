import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

async function getProduct(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/products/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Erro ao carregar o produto:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700 px-4">
        <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
        <p className="text-gray-500 mb-6">O produto que procura não existe ou foi removido.</p>
        <Link
          href="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const imageUrl = product.tbl_product_images?.[0]?.image_url;
  const price = Number(product.price);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb / Botão de Voltar */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center"
          >
            ← Voltar ao Catálogo
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
          {/* Imagem do Produto */}
          <div className="relative w-full h-80 sm:h-96 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                Sem imagem disponível
              </div>
            )}
          </div>

          {/* Informações e Ações */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block mb-4">
                SKU: {product.sku}
              </span>

              <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                {product.product_name}
              </h1>

              <div className="text-3xl font-black text-indigo-600 mb-6">
                R$ {price.toFixed(2)}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                  Descrição
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.description || product.short_description || "Nenhuma descrição detalhada fornecida para este produto."}
                </p>
              </div>
            </div>

            {/* Ação de Adicionar ao Carrinho */}
            <div className="border-t border-gray-100 pt-6">
              <AddToCartButton
                product={{
                  product_id: Number(product.product_id),
                  product_name: product.product_name,
                  price: price,
                  imageUrl: imageUrl || "",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}