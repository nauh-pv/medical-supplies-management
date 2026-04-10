import { useState } from "react";
import { Pagination } from "@/components/common";

type BranchStatus = "active" | "paused";

interface Branch {
  id: string;
  name: string;
  code: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  address: string;
  manager: string;
  phone: string;
  status: BranchStatus;
}

const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Precision Central",
    code: "CN001",
    icon: "local_hospital",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    address: "123 Phố Huế, Hai Bà Trưng, Hà Nội",
    manager: "Trần Hoàng Nam",
    phone: "024 3974 0000",
    status: "active",
  },
  {
    id: "2",
    name: "Precision Tây Hồ",
    code: "CN002",
    icon: "medical_services",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    address: "45 Xuân Diệu, Tây Hồ, Hà Nội",
    manager: "Lê Minh Trang",
    phone: "024 3719 1111",
    status: "active",
  },
  {
    id: "3",
    name: "Precision Lab Sài Gòn",
    code: "CN003",
    icon: "domain_disabled",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    address: "89 Đinh Tiên Hoàng, Quận 1, TP.HCM",
    manager: "Phạm Văn Đồng",
    phone: "028 3822 9999",
    status: "paused",
  },
  {
    id: "4",
    name: "Precision Da Nang",
    code: "CN004",
    icon: "vaccines",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    address: "202 Bạch Đằng, Hải Châu, Đà Nẵng",
    manager: "Võ Thị Sáu",
    phone: "0236 3811 111",
    status: "active",
  },
];

const TABLE_HEADERS = [
  "Tên chi nhánh",
  "Địa chỉ",
  "Người quản lý",
  "Số điện thoại",
  "Trạng thái",
  "Hành động",
];

export function BranchTable() {
  const [page, setPage] = useState(1);

  return (
    <div>
      {/* Action bar */}
      <div className="flex justify-between items-end mb-6">
        <div className="space-y-1">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Danh sách cơ sở
          </h3>
          <p className="text-sm text-on-surface-variant">
            Quản lý và cập nhật thông tin mạng lưới y tế.
          </p>
        </div>
        <button className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-headline font-bold text-sm flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-all shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Thêm chi nhánh mới
        </button>
      </div>

      {/* Table card */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-dim/30">
                {TABLE_HEADERS.map((h, i) => (
                  <th
                    key={h}
                    className={[
                      "px-6 py-4 text-[11px] font-label uppercase tracking-widest text-on-surface-variant",
                      i === TABLE_HEADERS.length - 1 ? "text-right" : "",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {mockBranches.map((branch, i) => (
                <tr
                  key={branch.id}
                  className={[
                    "hover:bg-surface-container-lowest transition-colors",
                    i % 2 !== 0 ? "bg-surface-container-lowest/40" : "",
                  ].join(" ")}
                >
                  {/* Name */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${branch.iconBg} ${branch.iconColor}`}
                      >
                        <span className="material-symbols-outlined">
                          {branch.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          {branch.name}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          Mã: {branch.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Address */}
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {branch.address}
                  </td>
                  {/* Manager */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container-high" />
                      <span className="text-sm text-on-surface-variant">
                        {branch.manager}
                      </span>
                    </div>
                  </td>
                  {/* Phone */}
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {branch.phone}
                  </td>
                  {/* Status */}
                  <td className="px-6 py-5">
                    {branch.status === "active" ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant">
                        Tạm dừng
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </button>
                      <button className="p-2 hover:bg-error-container/30 rounded-lg text-error transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-surface-dim/10 flex justify-between items-center text-xs text-on-surface-variant font-medium">
          <span>
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {(page - 1) * 10 + 1}–{Math.min(page * 10, 24)}
            </span>{" "}
            trong số 24 chi nhánh
          </span>
          <Pagination
            currentPage={page}
            totalPages={3}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
