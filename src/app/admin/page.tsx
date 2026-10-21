
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteProjectButton from "./projects/delete-project-button";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");


  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) redirect("/admin/login");

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(
      "id, title_id, title_en, slug, tools, featured, published, updated_at"
    )
    .order("updated_at", { ascending: false });

  if (projectsError) {
    throw new Error("Gagal memuat proyek dari database.");
  }

  const allProjects = projects ?? [];
  const publishedCount = allProjects.filter((p) => p.published).length;
  const draftCount = allProjects.length - publishedCount;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand-icon">&gt;_</span>
          <span>by<span className="admin-accent">.van</span></span>
        </Link>

        <p className="admin-nav-label">WORKSPACE</p>
        <Link href="/admin" className="admin-nav-link active">
          <span>▦</span> Dashboard
        </Link>
        <Link href="/admin/projects/new" className="admin-nav-link">
          <span>＋</span> New Project
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
            <p className="admin-eyebrow">CONTROL PANEL / OVERVIEW</p>
            <h1>Dashboard<span className="admin-accent">.</span></h1>
          </div>
          <div className="admin-user">
            <span className="admin-avatar">
              {(user.email ?? "A").charAt(0).toUpperCase()}
            </span>
            <span>{user.email}</span>
          </div>
        </header>

        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">WELCOME BACK, ADMIN</p>
            <h2>Your work. Your story.</h2>
            <p>Kelola proyek IT dan cybersecurity dari satu tempat.</p>
          </div>
          <Link href="/admin/projects/new" className="admin-primary-link">
            + Tambah Proyek
          </Link>
        </section>

        <section className="admin-stats">
          <article className="admin-stat-card">
            <p>TOTAL PROJECTS</p>
            <strong>{allProjects.length.toString().padStart(2, "0")}</strong>
            <span>Semua proyek</span>
          </article>
          <article className="admin-stat-card">
            <p>PUBLISHED</p>
            <strong>{publishedCount.toString().padStart(2, "0")}</strong>
            <span>Terlihat publik</span>
          </article>
          <article className="admin-stat-card">
            <p>DRAFTS</p>
            <strong>{draftCount.toString().padStart(2, "0")}</strong>
            <span>Belum dipublikasikan</span>
          </article>
        </section>

        <section className="admin-project-section">
          <div className="admin-section-heading">
            <div>
              <p className="admin-eyebrow">DATABASE / PROJECTS</p>
              <h2>Semua Proyek</h2>
            </div>
            <span className="admin-count">{allProjects.length} items</span>
          </div>

          {allProjects.length === 0 ? (
            <div className="admin-empty-state">
              <span className="admin-empty-icon">{"{ }"}</span>
              <h3>Belum ada proyek</h3>
              <p>Mulai isi portofoliomu dengan proyek pertamamu.</p>
              <Link href="/admin/projects/new" className="admin-primary-link">
                + Buat Proyek Pertama
              </Link>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PROJECT</th>
                    <th>TOOLS</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {allProjects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.title_id}</strong>
                        <small>/{project.slug}</small>
                      </td>
                      <td>{project.tools?.join(", ") || "—"}</td>
                      <td>
                        <span
                          className={
                            project.published
                              ? "admin-badge published"
                              : "admin-badge draft"
                          }
                        >
                          {project.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-project-actions">
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="admin-action-link"
                          >
                            Edit ↗
                          </Link>

                          <DeleteProjectButton
                            projectId={project.id}
                            projectTitle={project.title_id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="admin-footer">
          <span>by.vania ADMIN CONSOLE</span>
          <span>SECURE SESSION · 2026</span>
        </footer>
      </section>
    </main>
  );
}
