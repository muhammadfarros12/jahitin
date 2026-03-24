import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface LoginInput {
  email: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async ({ email, password }: LoginInput) => {
      const success = await login(email, password);
      if (!success) throw new Error("Email atau password salah");
      return true;
    },
    onSuccess: () => {
      toast.success("Login Berhasil");
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 300);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Login gagal");
    },
  });
};
