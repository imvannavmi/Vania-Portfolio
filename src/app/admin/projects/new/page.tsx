
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "./project-form";

export default async function NewProjectPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !admin) redirect("/admin/login");

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand-icon">&gt;_</span>
          <span>by<span className="admin-accent">.van</span></span>
        </Link>

        <p className="admin-nav-label">WORKSPACE</p>
        <Link href="/admin" className="admin-nav-link">
          ▦ Dashboard
        </Link>
        <Link href="/admin/projects/new" className="admin-nav-link active">
          ＋ New Project
        </Link>

        <div className="admin-sidebar-bottom">
          <span className="admin-status-dot" />
          SYSTEM ONLINE
          <form action="/admin/logout" method="post">
            <button className="admin-logout-button" type="submit">
              Logout ↗
            </button>
          </form>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">WORKSPACE / NEW ENTRY</p>
            <h1>Tambah Proyek<span className="admin-accent">.</span></h1>
          </div>
          <Link href="/admin" className="admin-action-link">
            ← Kembali ke dashboard
          </Link>
        </header>

        <div className="project-form-intro">
          <p>
            Isi detail proyekmu. Field bertanda * wajib diisi.
            Proyek draft tidak ditampilkan kepada pengunjung.
          </p>
        </div>

        <ProjectForm />

        <footer className="admin-footer">
          <span>by.vania ADMIN CONSOLE</span>
          <span>NEW PROJECT ENTRY</span>
        </footer>
      </section>
    </main>
  );
}
