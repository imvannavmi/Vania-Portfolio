
import { redirect, notFound } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/server";
import EditProjectForm from "./edit-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({
  params,
}: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, title_id, title_en, slug, summary_id, summary_en, tools, github_url, demo_url, featured, published, cover_image_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil data proyek: ${error.message}`);
  }

  if (!project) {
    notFound();
  }

  return (
    <main className="admin-main">
      <div className="project-form-intro">
        <a href="/admin" className="project-cancel-button">
          ← Kembali ke dashboard
        </a>
        <h1>Edit Proyek</h1>
        <p>Perbarui informasi proyek portofoliomu.</p>
      </div>

      <EditProjectForm project={project} />
    </main>
  );
}
