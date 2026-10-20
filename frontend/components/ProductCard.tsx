'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    product_id: string | number;
    product_name: string;
    price: number | string;
    sku?: string; // Opcional para evitar erros de tipo
    tbl_product_images?: Array<{ image_url: string }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // Obter a primeira imagem disponível ou usar um placeholder
  const imageUrl = 
    product.tbl_product_images && product.tbl_product_images.length > 0
      ? product.tbl_product_images[0].image_url
      : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60';

  // Formatar preço para o padrão brasileiro (R$)
  const formattedPrice = Number(product.price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Imagem do Produto com efeito Zoom */}
      <Link href={`/produtos/${product.product_id}`} className="relative block w-full h-64 bg-gray-50 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.product_name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {product.sku && (
          <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 shadow-xs">
            SKU: {product.sku}
          </div>
        )}
      </Link>

      {/* Informações do Produto */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
            Natura & Avon
          </span>
          <Link href={`/produtos/${product.product_id}`}>
            <h3 className="font-medium text-gray-800 text-sm md:text-base line-clamp-2 mt-1 group-hover:text-rose-600 transition-colors">
              {product.product_name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">Preço</span>
            <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
          </div>

          <Link
            href={`/produtos/${product.product_id}`}
            className="bg-gray-900 hover:bg-rose-600 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors duration-200 shadow-sm"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}