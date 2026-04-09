import { useState } from "react";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { OrderSummary } from "@/components/pos/OrderSummary";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);

  function handleAddToCart(product: {
    id: string;
    name: string;
    price: number;
  }) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, qty: 1 },
      ];
    });
  }

  function handleQtyChange(id: string, delta: number) {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.qty + delta <= 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i));
    });
  }

  function handleRemove(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="ml-72 pt-16 flex h-screen overflow-hidden bg-background">
      <ProductGrid onAddToCart={handleAddToCart} />
      <OrderSummary
        items={cart}
        onQtyChange={handleQtyChange}
        onRemove={handleRemove}
      />
    </div>
  );
}
