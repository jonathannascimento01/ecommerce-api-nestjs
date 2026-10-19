"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems, totalPrice } = useCart();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          Loja Online - Erika
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-indigo-600 font-medium">
            Catálogo
          </Link>
          
          <Link href="/cart" className="flex items-center bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full border border-indigo-100 transition-colors">
            <span className="text-sm text-indigo-700 font-medium mr-2">
              🛒 {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </span>
            <span className="text-sm font-bold text-indigo-900">
              R$ {totalPrice.toFixed(2)}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}