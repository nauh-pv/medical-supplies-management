import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { OrderSummary } from "@/components/pos/OrderSummary";
import { BatchSelectModal } from "@/components/pos/BatchSelectModal";
import { createPosTransaction } from "@/services/pos";
import { useUserContext } from "@/contexts/UserContext";
import type { MedicineDoc, BatchDoc, ServiceDoc } from "@/types/firestore";

export interface CartItem {
  id: string; // batchId or serviceId — unique key per cart row
  itemType: "medicine" | "service";
  medicineId: string;
  name: string;
  price: number;
  qty: number;
  sku: string;
  lot?: string;
  batchId?: string;
  unitId: string;
  unitName: string;
  stock?: number; // available qty in this batch; undefined for services
  importPrice: number;
}

export function POS() {
  const userDoc = useUserContext();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mobileView, setMobileView] = useState<"products" | "cart">("products");

  // Batch select modal state
  const [pendingMedicine, setPendingMedicine] = useState<{
    medicine: MedicineDoc;
    stock: number;
  } | null>(null);

  const locationId = userDoc?.branchId || "WAREHOUSE";

  // Auto-dismiss notifications
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 5000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  function handleMedicineClick(medicine: MedicineDoc, stock: number) {
    setPendingMedicine({ medicine, stock });
  }

  function handleBatchSelect(batch: BatchDoc) {
    if (!pendingMedicine) return;
    const { medicine } = pendingMedicine;
    setCart((prev) => {
      // If the same batch already in cart, just increment qty
      const existing = prev.find((i) => i.id === batch.id);
      if (existing) {
        if (existing.qty >= batch.quantity) return prev;
        return prev.map((i) =>
          i.id === batch.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: batch.id,
          itemType: "medicine",
          medicineId: medicine.id,
          name: medicine.name,
          price: medicine.sellPrice,
          qty: 1,
          sku: medicine.sku,
          lot: batch.lot,
          batchId: batch.id,
          unitId: medicine.unitId,
          unitName: medicine.unitName,
          stock: batch.quantity,
          importPrice: batch.importPrice,
        },
      ];
    });
  }

  function handleServiceSelect(service: ServiceDoc) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === service.id);
      if (existing) {
        return prev.map((i) =>
          i.id === service.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: service.id,
          itemType: "service",
          medicineId: service.id,
          name: service.name,
          price: service.price,
          qty: 1,
          sku: service.code,
          unitId: "SERVICE",
          unitName: "Dịch vụ",
          importPrice: 0,
        },
      ];
    });
  }

  function handleQtyChange(id: string, delta: number) {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter((i) => i.id !== id);
      const availableStock = item.stock ?? 0;
      if (newQty > availableStock) return prev; // cap at batch stock
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
    // Capture cart info before async (React batching keeps cart valid here,
    // but snapshot is more explicit)
    const cartSnapshot = cart;
    setCheckingOut(true);
    try {
      await createPosTransaction({
        branchId: userDoc.branchId || "WAREHOUSE",
        branchName: userDoc.branchName || "Kho Tổng",
        createdBy: userDoc.uid,
        createdByName: userDoc.displayName,
        items: cartSnapshot.map((i) => ({
          itemType: i.itemType,
          medicineId: i.medicineId,
          medicineName: i.name,
          medicineSku: i.sku,
          batchId: i.batchId ?? "",
          lot: i.lot ?? "",
          unitId: i.unitId,
          unitName: i.unitName,
          unitPrice: i.price,
          importPrice: i.importPrice,
          quantity: i.qty,
        })),
        discount,
        paymentMethod,
        notes: "",
      });
      setCart([]);
      setRefetchTrigger((t) => t + 1);
      setSuccessMsg(
        `Thanh toán thành công! ${cartSnapshot.reduce((s, i) => s + i.qty, 0)} đơn vị · ${cartSnapshot.reduce((s, i) => s + i.price * i.qty - discount, 0).toLocaleString("vi-VN")}₫`,
      );
    } catch (err) {
      console.error("POS checkout error:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Thanh toán thất bại. Vui lòng thử lại.",
      );
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="md:ml-72 pt-16 flex flex-col md:flex-row h-screen overflow-hidden bg-background relative">
      {/* Success toast */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold">
          <span className="material-symbols-outlined text-lg">
            check_circle
          </span>
          {successMsg}
        </div>
      )}

      {/* Error toast */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-error text-on-error px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold">
          <span className="material-symbols-outlined text-lg">error</span>
          {errorMsg}
        </div>
      )}

      {/* Mobile tab toggle — hidden on desktop */}
      <div className="flex md:hidden flex-shrink-0 bg-surface-container-lowest border-b border-surface-container-low">
        <button
          onClick={() => setMobileView("products")}
          className={[
            "flex-1 py-3 text-sm font-label font-semibold transition-colors",
            mobileView === "products"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant",
          ].join(" ")}
        >
          Sản phẩm
        </button>
        <button
          onClick={() => setMobileView("cart")}
          className={[
            "flex-1 py-3 text-sm font-label font-semibold transition-colors relative",
            mobileView === "cart"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant",
          ].join(" ")}
        >
          Đơn hàng
          {cart.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Product Grid — full on desktop, conditional on mobile */}
      <div
        className={[
          "flex-1 min-h-0 md:flex",
          mobileView === "products" ? "flex" : "hidden",
        ].join(" ")}
      >
        <ProductGrid
          onMedicineClick={(medicine, stock) => {
            handleMedicineClick(medicine, stock);
            // Auto-switch to products view to show batch modal
          }}
          onServiceClick={handleServiceSelect}
          refetchTrigger={refetchTrigger}
        />
      </div>

      {/* Order Summary — fixed width on desktop, full on mobile */}
      <div
        className={[
          "md:flex md:w-[400px] md:flex-shrink-0 flex-col",
          mobileView === "cart" ? "flex flex-1 min-h-0" : "hidden",
        ].join(" ")}
      >
        <OrderSummary
          items={cart}
          onQtyChange={handleQtyChange}
          onRemove={handleRemove}
          onCheckout={async (pm, disc) => {
            await handleCheckout(pm, disc);
            setMobileView("products");
          }}
          checkingOut={checkingOut}
        />
      </div>
      <BatchSelectModal
        open={!!pendingMedicine}
        onClose={() => setPendingMedicine(null)}
        medicine={pendingMedicine?.medicine ?? null}
        locationId={locationId}
        onSelect={handleBatchSelect}
      />
    </div>
  );
}
