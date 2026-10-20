
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        throw new Error("Akun ini tidak memiliki akses admin.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <p className="admin-eyebrow">CYBER.LAB / AUTHENTICATION</p>
        <h1>Admin Login</h1>
        <p className="admin-login-description">
          Masuk untuk mengelola portofolio.
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="admin-login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Memverifikasi..." : "Masuk ke Dashboard →"}
        </button>

        <p className="admin-login-footer">
          ACCESS RESTRICTED · AUTHORIZED USERS ONLY
        </p>
      </form>
    </main>
  );
}
