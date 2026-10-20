'use client';

interface Product {
  product_id: string | number;
  product_name: string;
  price: string | number;
  image_url?: string;
  sku?: string;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

    const index = existingCart.findIndex((item: any) => item.product_id === product.product_id);

    if (index > -1) {
      existingCart[index].quantity += 1;
    } else {
      existingCart.push({
        product_id: product.product_id,
        product_name: product.product_name,
        price: Number(product.price),
        image_url: product.image_url,
        sku: product.sku,
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispara um evento personalizado para atualizar o contador na navbar
    window.dispatchEvent(new Event('storage'));

    alert('Produto adicionado ao carrinho com sucesso!');
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors shadow-sm text-center"
    >
      Adicionar ao Carrinho
    </button>
  );
}