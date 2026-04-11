import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { OrderSummary } from "@/components/pos/OrderSummary";
import { createPosTransaction } from "@/services/pos";
import { useUserContext } from "@/contexts/UserContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  sku: string;
  unitId: string;
  unitName: string;
  stock: number;
}

export function POS() {
  const userDoc = useUserContext();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  function handleAddToCart(product: {
    id: string;
    name: string;
    price: number;
    sku: string;
    unitId: string;
    unitName: string;
    stock: number;
  }) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        // Don't exceed available stock
        if (existing.qty >= product.stock) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function handleQtyChange(id: string, delta: number) {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter((i) => i.id !== id);
      if (newQty > item.stock) return prev; // cap at stock
      return prev.map((i) => (i.id === id ? { ...i, qty: newQty } : i));
    });
  }

  function handleRemove(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleCheckout(
    paymentMethod: "cash" | "card" | "transfer",
    discount: number,
  ) {
    if (!userDoc || cart.length === 0) return;
    setCheckingOut(true);
    try {
      await createPosTransaction({
        branchId: userDoc.branchId ?? "WAREHOUSE",
        branchName: userDoc.branchName ?? "Kho Tổng",
        createdBy: userDoc.uid,
        createdByName: userDoc.displayName,
        items: cart.map((i) => ({
          medicineId: i.id,
          medicineName: i.name,
          medicineSku: i.sku,
          unitId: i.unitId,
          unitName: i.unitName,
          unitPrice: i.price,
          quantity: i.qty,
        })),
        discount,
        paymentMethod,
        notes: "",
      });
      setCart([]);
      setRefetchTrigger((t) => t + 1);
      setSuccessMsg(
        `Thanh toán thành công! ${cart.length} sản phẩm · ${cart.reduce((s, i) => s + i.qty, 0)} đơn vị`,
      );
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="ml-72 pt-16 flex h-screen overflow-hidden bg-background relative">
      {/* Success toast */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-lg">
            check_circle
          </span>
          {successMsg}
        </div>
      )}

      <ProductGrid
        onAddToCart={handleAddToCart}
        refetchTrigger={refetchTrigger}
      />
      <OrderSummary
        items={cart}
        onQtyChange={handleQtyChange}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
        checkingOut={checkingOut}
      />
    </div>
  );
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  sku: string;
  unitId: string;
  unitName: string;
}

export function POS() {
  const userDoc = useUserContext();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  function handleAddToCart(product: {
    id: string;
    name: string;
    price: number;
    sku: string;
    unitId: string;
    unitName: string;
  }) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
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

  async function handleCheckout(
    paymentMethod: "cash" | "card" | "transfer",
    discount: number,
  ) {
    if (!userDoc || cart.length === 0) return;
    setCheckingOut(true);
    try {
      await createPosTransaction({
        branchId: userDoc.branchId ?? "WAREHOUSE",
        branchName: userDoc.branchName ?? "Kho Tổng",
        createdBy: userDoc.uid,
        createdByName: userDoc.displayName,
        items: cart.map((i) => ({
          medicineId: i.id,
          medicineName: i.name,
          medicineSku: i.sku,
          unitId: i.unitId,
          unitName: i.unitName,
          unitPrice: i.price,
          quantity: i.qty,
        })),
        discount,
        paymentMethod,
        notes: "",
      });
      setCart([]);
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="ml-72 pt-16 flex h-screen overflow-hidden bg-background">
      <ProductGrid onAddToCart={handleAddToCart} />
      <OrderSummary
        items={cart}
        onQtyChange={handleQtyChange}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
        checkingOut={checkingOut}
      />
    </div>
  );
}
