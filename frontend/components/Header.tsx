'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { cart } = useCart();
  
  // Contar total de itens no carrinho
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logótipo / Nome da Loja */}
        <Link href="/" className="font-bold text-xl text-gray-900 tracking-tight flex items-center gap-2">
          <span className="bg-rose-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs">
            K
          </span>
          <span>Kezam Store</span>
        </Link>

        {/* Navegação e Carrinho */}
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">
            Catálogo
          </Link>
          <Link href="/orders" className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">
            Meus Pedidos
          </Link>

          {/* Botão do Carrinho */}
          <Link
            href="/cart"
            className="relative bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-800 transition-all flex items-center gap-2"
          >
            <span>Carrinho</span>
            {totalItems > 0 && (
              <span className="bg-rose-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}