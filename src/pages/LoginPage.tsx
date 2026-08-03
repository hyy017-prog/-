import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CubeIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  translateAuthError,
} from "@/services/authService";

const loginSchema = z.object({
  email: z.string().min(1, "請輸入 Email").email("Email 格式不正確"),
  password: z.string().min(6, "密碼至少需要 6 個字元"),
});

const registerSchema = loginSchema.extend({
  displayName: z.string().min(1, "請輸入姓名"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);

  const schema = mode === "login" ? loginSchema : registerSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm & Partial<RegisterForm>>({
    resolver: zodResolver(schema),
  });

  if (!initializing && user) return <Navigate to="/" replace />;

  const onSubmit = async (values: LoginForm & Partial<RegisterForm>) => {
    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithEmail(values.email, values.password);
      } else {
        await registerWithEmail(
          values.email,
          values.password,
          values.displayName ?? ""
        );
      }
      toast.success("登入成功");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(translateAuthError(err?.code ?? ""));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success("登入成功");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(translateAuthError(err?.code ?? ""));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-3">
            <CubeIcon className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">PrintOS</h1>
          <p className="text-sm text-ink-500 mt-1">3D 列印管理平台</p>
        </div>

        <div className="card p-6">
          <div className="flex mb-6 rounded-xl bg-black/5 dark:bg-white/5 p-1">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-white dark:bg-white/10 shadow-sm"
                  : "text-ink-500"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              登入
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-white dark:bg-white/10 shadow-sm"
                  : "text-ink-500"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              註冊
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === "register" && (
              <Input
                label="姓名"
                id="displayName"
                placeholder="王小明"
                {...register("displayName")}
                error={errors.displayName?.message}
              />
            )}
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="密碼"
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={submitting}
            >
              {mode === "login" ? "登入" : "建立帳號"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <span className="text-xs text-ink-500">或</span>
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogle}
            isLoading={submitting}
            type="button"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            使用 Google 登入
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
