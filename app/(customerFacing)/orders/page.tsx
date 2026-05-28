"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/formatters";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <h1 className="text-3xl font-bold">No Orders Yet</h1>
        <p className="text-gray-500">You have not made any purchases yet.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">My Orders</h1>
      {orders.map(order => (
        <div key={order.id} className="flex gap-4 items-center bg-white rounded-xl shadow p-4 border border-gray-100">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{order.product.name}</h2>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-green-600 font-semibold">{formatPrice(order.pricePaidInCents / 100)}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/products/${order.product.id}/purchase`}>Buy Again</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
