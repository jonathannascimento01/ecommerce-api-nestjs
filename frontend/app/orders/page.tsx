export const instant = false;
import Link from "next/link";
async function getOrders() {
  try {
    const res = await fetch("http://localhost:4000/orders", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro ao carregar os pedidos:", error);
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Histórico de Pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">Consulte o estado e os detalhes das suas compras anteriores.</p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← Voltar ao Catálogo
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ainda não tem pedidos</h2>
            <p className="text-gray-500 text-sm mb-6">Assim que finalizar uma compra, ela aparecerá listada aqui.</p>
            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Explorar Produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const totalAmount = Number(order.total_amount);
              const createdAt = new Date(order.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-gray-100 gap-2">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        {order.order_number || `Pedido #${order.order_id}`}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">Realizado em: {createdAt}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {order.status}
                      </span>
                      <span className="text-lg font-black text-indigo-600">
                        R$ {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Itens do Pedido
                    </h4>
                    <div className="divide-y divide-gray-50">
                      {order.tbl_order_items?.map((item: any) => {
                        const unitPrice = Number(item.unit_price);
                        const subtotal = Number(item.subtotal);

                        return (
                          <div key={item.order_item_id} className="py-2.5 flex justify-between items-center text-sm">
                            <div className="text-gray-700">
                              <span className="font-medium text-gray-900">Produto ID: {item.product_id.toString()}</span>
                              <span className="text-gray-400 mx-2">×</span>
                              <span className="font-semibold text-gray-800">{item.quantity} un.</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-400 mr-2">(R$ {unitPrice.toFixed(2)} un.)</span>
                              <span className="font-bold text-gray-900">R$ {subtotal.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}