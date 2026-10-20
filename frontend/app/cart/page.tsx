'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  product_id: string | number;
  product_name: string;
  price: number | string;
  quantity: number;
  image_url?: string;
  sku?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao ler o carrinho:', e);
      }
    }
    setLoading(false);
  }, []);

  const updateQuantity = (product_id: string | number, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.product_id === product_id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];

    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (product_id: string | number) => {
    const updated = cartItems.filter(item => item.product_id !== product_id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const customerId = 1;
      const addressId = 1;

      const orderData = {
        customer_id: customerId,
        address_id: addressId,
        total_amount: totalPrice,
        subtotal_amount: totalPrice,
        items: cartItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: item.quantity,
          unit_price: Number(item.price),
          subtotal: Number(item.price) * item.quantity,
        })),
      };

      const res = await fetch('http://localhost:4000/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Falha ao registar o pedido no servidor.');
      }

      localStorage.removeItem('cart');
      setCartItems([]);
      
      alert('Compra finalizada com sucesso! O pedido foi registado.');
      router.push('/orders');
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      alert(error.message || 'Erro ao finalizar a compra. Verifique o console.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">A carregar o carrinho...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Carrinho de Compras</h1>
            <p className="text-sm text-gray-500 mt-1">Reveja os seus itens selecionados antes de finalizar.</p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
          >
            ← Continuar a Comprar
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🛒
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">O seu carrinho está vazio</h2>
            <p className="text-gray-500 text-sm mb-6">Explore o nosso catálogo e adicione produtos incríveis.</p>
            <Link
              href="/"
              className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                >
                  <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=60'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.product_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku || 'N/A'}</p>
                    <p className="text-sm font-extrabold text-rose-600 mt-2">
                      R$ {Number(item.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full">
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-gray-400 hover:text-red-500 text-xs font-medium transition-colors"
                    >
                      Remover
                    </button>

                    <div className="flex items-center gap-2 mt-4 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="text-gray-600 hover:text-black font-bold px-1"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-gray-800 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="text-gray-600 hover:text-black font-bold px-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo da Compra</h3>
              
              <div className="space-y-3 text-sm text-gray-600 border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envio</span>
                  <span className="text-emerald-600 font-medium">Grátis</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-rose-600">R$ {totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-medium py-3.5 px-4 rounded-xl transition-colors shadow-sm text-center block cursor-pointer"
              >
                {submitting ? 'A processar...' : 'Finalizar Compra'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}