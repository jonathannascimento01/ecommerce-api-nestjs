import Link from "next/link";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:4000/products", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section / Banner de Boas-Vindas */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-16 px-4 sm:px-6 lg:px-8 mb-12 shadow-inner">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Descubra os Melhores Produtos
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Qualidade, estilo e os melhores preços reunidos num só lugar. Explore o nosso catálogo exclusivo.
          </p>
          <div className="inline-flex rounded-md shadow">
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
            >
              Ver Catálogo
            </a>
          </div>
        </div>
      </section>

      {/* Grelha de Produtos */}
      <main id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h2>
          <span className="text-sm text-gray-500 font-medium">
            {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-lg mx-auto">
            <p className="text-gray-500 text-lg mb-2">Ainda não há produtos disponíveis.</p>
            <p className="text-sm text-gray-400">Certifique-se de que o seu servidor NestJS está a correr corretamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product: any) => {
              const imageUrl = product.tbl_product_images?.[0]?.image_url;
              const price = Number(product.price);

              return (
                <div
                  key={product.product_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
                >
                  <div>
                    {/* Imagem do Produto */}
                    <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                          Sem imagem
                        </div>
                      )}
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-indigo-600 shadow-sm">
                        Novo
                      </span>
                    </div>

                    {/* Informações */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.product_name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {product.short_description || product.description || "Sem descrição disponível."}
                      </p>
                    </div>
                  </div>

                  {/* Preço e Botão */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-50 mt-auto pt-4">
                    <div>
                      <span className="text-xs text-gray-400 block">Preço</span>
                      <span className="text-xl font-extrabold text-indigo-600">
                        R$ {price.toFixed(2)}
                      </span>
                    </div>

                    <Link
                      href={`/produtos/${product.product_id}`}
                      className="inline-flex items-center justify-center bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}