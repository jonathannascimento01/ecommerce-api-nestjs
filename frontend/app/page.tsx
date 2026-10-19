import Link from "next/link";
import { Suspense } from "react";
import AddToCartButton from "@/components/AddToCartButton";

async function ProductList() {
  let products = [];
  try {
    const res = await fetch("http://localhost:4000/products", {
      cache: "no-store",
    });
    if (res.ok) {
      products = await res.json();
    }
  } catch (error) {
    console.error("Erro ao carregar os produtos:", error);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-500 text-lg">Nenhum produto encontrado ou erro ao conectar com o servidor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product: any) => {
        const imageUrl = product.tbl_product_images?.[0]?.image_url;
        const price = Number(product.price);

        return (
          <div
            key={product.product_id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div>
              <Link href={`/produtos/${product.product_id}`}>
                <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.product_name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                      Sem imagem
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-3 inline-block">
                  SKU: {product.sku}
                </span>
                <Link href={`/produtos/${product.product_id}`}>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 hover:text-indigo-600 transition-colors">
                    {product.product_name}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {product.short_description || product.description || "Sem descrição disponível."}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-between">
              <span className="text-2xl font-black text-indigo-600">
                R$ {price.toFixed(2)}
              </span>
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
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Catálogo de Produtos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore os nossos produtos de alta qualidade com os melhores preços.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-20 text-gray-500">A carregar produtos...</div>}>
          <ProductList />
        </Suspense>
      </div>
    </div>
  );
}