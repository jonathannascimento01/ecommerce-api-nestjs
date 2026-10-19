"use client";

import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  product: {
    product_id: number | string;
    product_name: string;
    price: number;
    imageUrl?: string;
    sku?: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => {
        addToCart(product);
        alert('Produto adicionado ao carrinho com sucesso!');
      }}
      className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition-colors shadow-sm cursor-pointer"
    >
      Adicionar ao Carrinho
    </button>
  );
}