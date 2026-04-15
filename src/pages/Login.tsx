import { useState } from "react";
import { Input, Button } from "@/components/common";
import { signIn } from "@/services/auth";

interface LoginProps {
  onNavigateToRegister?: () => void;
  onLogin?: () => void;
}

export function Login({ onNavigateToRegister, onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      onLogin?.();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else if (code === "auth/too-many-requests") {
        setError("Quá nhiều lần thử. Vui lòng thử lại sau.");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.06)] bg-surface-container-lowest">
          {/* Left: Login form */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-on-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    medical_services
                  </span>
                </div>
                <span className="text-2xl font-extrabold tracking-tighter text-primary font-headline">
                  MediStock Precision
                </span>
              </div>
              <h1 className="text-3xl font-bold text-on-surface font-headline tracking-tight mb-2">
                Chào mừng trở lại
              </h1>
              <p className="text-on-surface-variant text-sm">
                Hệ thống Quản lý Tổng Kho Y tế Kỹ thuật cao
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-label">
                  Email
                </label>
                <Input
                  leadingIcon="person"
                  placeholder="name@hospital.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-label">
                    Mật khẩu
                  </label>
                </div>
                <Input
                  leadingIcon="lock"
                  trailingIcon={showPassword ? "visibility_off" : "visibility"}
                  onTrailingIconClick={() => setShowPassword((v) => !v)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-outline-variant bg-surface-container-low"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-on-surface-variant"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {error && (
                <p className="text-sm text-error bg-error/10 px-4 py-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center py-4"
              >
                {loading ? "Đang xử lý…" : "Đăng nhập hệ thống"}
              </Button>
            </form>

            <div className="mt-12 flex items-center justify-center gap-6">
              <span className="h-px bg-surface-container-high flex-grow" />
              <span className="text-xs font-label uppercase tracking-widest text-outline">
                Bảo mật cấp độ lâm sàng
              </span>
              <span className="h-px bg-surface-container-high flex-grow" />
            </div>
          </div>

          {/* Right: Visual panel */}
          <div className="hidden md:block relative bg-primary overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-16 text-on-primary">
              <div
                className="p-8 rounded-[1.5rem] mb-8 border border-white/10"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Hệ thống đang hoạt động
                </div>
                <h2 className="text-4xl font-bold font-headline leading-tight mb-4 tracking-tight">
                  Tối ưu hóa nguồn lực Y tế với Độ chính xác tuyệt đối.
                </h2>
                <p className="text-on-primary/70 text-lg leading-relaxed">
                  Quản lý hàng ngàn danh mục thiết bị và dược phẩm với quy trình
                  chuẩn hóa ISO.
                </p>
              </div>
              <div className="flex gap-8 items-center justify-center text-on-primary/60">
                {[
                  { value: "99.9%", label: "Độ chính xác" },
                  { value: "24/7", label: "Giám sát kho" },
                ].map((stat, i) => (
                  <span key={stat.label} className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-on-primary font-headline">
                        {stat.value}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest">
                        {stat.label}
                      </span>
                    </div>
                    {i < 1 && <span className="w-px h-8 bg-white/20" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
