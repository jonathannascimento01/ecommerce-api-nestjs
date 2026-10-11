'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  sku: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((response: any) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error: any) => {
        console.error('Erro ao carregar produtos:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">A nossa Loja Online</h1>
          <p className="mt-2 text-lg text-gray-600">Descubra os nossos produtos em destaque</p>
        </header>

        {loading ? (
          <p className="text-center text-gray-500">A carregar produtos...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.product_id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{product.product_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}