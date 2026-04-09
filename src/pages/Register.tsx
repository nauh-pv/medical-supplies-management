import { useState } from "react";
import { Input, Button } from "@/components/common";

interface RegisterProps {
  onNavigateToLogin?: () => void;
  onRegister?: () => void;
}

const ROLES = [
  { value: "admin", label: "Quản trị viên" },
  { value: "staff", label: "Nhân viên chi nhánh" },
  { value: "manager", label: "Quản lý kho" },
];

export function Register({ onNavigateToLogin, onRegister }: RegisterProps) {
  const [agreed, setAgreed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (agreed) onRegister?.();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Abstract background blobs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[50%] rounded-full bg-secondary-container/5 blur-[100px]" />
      </div>

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full flex flex-col md:flex-row bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.06)] overflow-hidden">
          {/* Left: Brand panel */}
          <div className="hidden md:flex md:w-5/12 bg-primary relative p-12 flex-col justify-between overflow-hidden">
            {/* Decorative bg */}
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-primary-container" />
            <div className="z-10">
              <div className="flex items-center gap-2 mb-8">
                <span
                  className="material-symbols-outlined text-on-primary text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  medical_services
                </span>
                <h2 className="text-on-primary font-headline font-extrabold text-2xl tracking-tighter">
                  MediStock Precision
                </h2>
              </div>
              <h1 className="text-on-primary text-4xl font-headline font-bold leading-tight mb-6">
                Nền tảng quản lý kho y tế tối ưu
              </h1>
              <p className="text-on-primary/80 leading-relaxed">
                Hệ thống đồng bộ hóa dữ liệu thời gian thực, đảm bảo tính chính
                xác tuyệt đối cho vật tư y tế của bạn.
              </p>
            </div>
            <div className="z-10 mt-auto">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                </div>
                <div>
                  <p className="text-on-primary text-sm font-semibold">
                    Bảo mật cấp độ lâm sàng
                  </p>
                  <p className="text-on-primary/60 text-xs">
                    Tuân thủ tiêu chuẩn HIPAA &amp; ISO
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Registration form */}
          <div className="w-full md:w-7/12 p-8 md:p-14">
            <div className="mb-8">
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">
                Tạo tài khoản mới
              </h3>
              <p className="text-on-surface-variant text-sm">
                Bắt đầu quản lý kho dược phẩm của bạn một cách khoa học.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Họ và tên"
                  leadingIcon="person"
                  placeholder="Nguyễn Văn A"
                />
                <Input
                  label="Email công việc"
                  leadingIcon="mail"
                  placeholder="example@med.vn"
                  type="email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Số điện thoại"
                  leadingIcon="call"
                  placeholder="09xx xxx xxx"
                  type="tel"
                />

                {/* Role selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                    Vai trò hệ thống
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">
                      badge
                    </span>
                    <select className="w-full pl-12 pr-10 py-3 bg-surface-container-low rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      <option value="">Chọn vai trò</option>
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Mật khẩu"
                  leadingIcon="lock"
                  placeholder="••••••••"
                  type="password"
                />
                <Input
                  label="Xác nhận mật khẩu"
                  leadingIcon="lock_reset"
                  placeholder="••••••••"
                  type="password"
                />
              </div>

              <div className="pt-2 flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 border-outline-variant bg-surface-container-low"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-on-surface-variant leading-relaxed"
                >
                  Bằng cách nhấn đăng ký, bạn đồng ý với{" "}
                  <a
                    href="#"
                    className="text-primary font-semibold hover:underline"
                  >
                    Điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a
                    href="#"
                    className="text-primary font-semibold hover:underline"
                  >
                    Chính sách bảo mật
                  </a>{" "}
                  của MedPrecision Systems.
                </label>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  icon="arrow_forward"
                  iconPosition="right"
                  className="w-full justify-center py-4"
                >
                  Đăng ký tài khoản
                </Button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-on-surface-variant">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-primary font-bold hover:underline ml-1"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 flex flex-col md:flex-row justify-between items-center px-12 border-t border-surface-container-low bg-surface-container-lowest">
        <span className="text-xs uppercase tracking-widest text-on-surface-variant">
          © 2024 MedPrecision Systems. Clinical Sanctuary Design.
        </span>
        <div className="flex gap-8 mt-4 md:mt-0">
          {["Privacy Policy", "Terms of Service", "System Status"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
