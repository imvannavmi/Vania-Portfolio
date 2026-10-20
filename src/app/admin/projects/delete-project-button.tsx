
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  projectId: string;
  projectTitle: string;
};

export default function DeleteProjectButton({
  projectId,
  projectTitle,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Yakin ingin menghapus proyek "${projectTitle}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
        return;
      }

      const { data: admin } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!admin) {
        setErrorMessage("Akun ini tidak memiliki akses admin.");
        return;
      }

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.refresh();
    } catch {
      setErrorMessage("Terjadi kesalahan saat menghapus proyek.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="project-delete-button"
      >
        {deleting ? "Menghapus..." : "Hapus"}
      </button>

      {errorMessage && (
        <span className="project-delete-error" role="alert">
          {errorMessage}
        </span>
      )}
    </span>
  );
}
