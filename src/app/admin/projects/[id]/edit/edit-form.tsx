
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../lib/supabase/client";
import ProjectContentEditor, {
  type ProjectContentBlock,
} from "@/components/admin/project-content-editor";

type Project = {
  id: string;
  title_id: string;
  title_en: string;
  slug: string;
  summary_id: string;
  summary_en: string;
  content_id: unknown;
  content_en: unknown;
  tools: string[] | null;
  github_url: string | null;
  demo_url: string | null;
  featured: boolean;
  published: boolean;
  cover_image_url: string | null;
};

function normalizeProjectContent(
  value: unknown,
  prefix: string
): ProjectContentBlock[] {
  if (!Array.isArray(value)) return [];

  const validTypes = [
    "paragraph",
    "list",
    "steps",
    "code",
    "image",
    "test-results",
  ] as const;

  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];

    const raw = item as Record<string, unknown>;
    const type = validTypes.includes(
      raw.type as (typeof validTypes)[number]
    )
      ? (raw.type as ProjectContentBlock["type"])
      : "paragraph";

    const textValue = (...values: unknown[]) =>
      values.find((value) => typeof value === "string") as
        | string
        | undefined;

    const items = Array.isArray(raw.items)
      ? raw.items.filter(
          (entry): entry is string => typeof entry === "string"
        )
      : [];

    const tests = Array.isArray(raw.tests)
      ? raw.tests.flatMap((entry) => {
          if (!entry || typeof entry !== "object") return [];

          const test = entry as Record<string, unknown>;
          const status: "passed" | "failed" | "pending" =
            test.status === "passed" ||
            test.status === "failed" ||
            test.status === "pending"
              ? test.status
              : "pending";

          return [{
            scenario: textValue(test.scenario) ?? "",
            expected: textValue(test.expected) ?? "",
            actual: textValue(test.actual) ?? "",
            status,
          }];
        })
      : [];

    return [{
      id: textValue(raw.id) ?? `${prefix}-${index + 1}`,
      type,
      heading: textValue(raw.heading, raw.title) ?? "",
      body: textValue(raw.body, raw.text, raw.content) ?? "",
      items,
      imageUrl: textValue(raw.imageUrl, raw.image_url) ?? "",
      imageAlt: textValue(raw.imageAlt, raw.image_alt) ?? "",
      language: textValue(raw.language) ?? "text",
      tests,
    }];
  });
}
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function EditProjectForm({
  project,
}: {
  project: Project;
}) {
  const router = useRouter();

  const [titleId, setTitleId] = useState(project.title_id);
  const [titleEn, setTitleEn] = useState(project.title_en);
  const [slug, setSlug] = useState(project.slug);
  const [summaryId, setSummaryId] = useState(project.summary_id);
  const [summaryEn, setSummaryEn] = useState(project.summary_en);
const [contentId, setContentId] = useState<ProjectContentBlock[]>(
  () => normalizeProjectContent(project.content_id, "id")
);
const [contentEn, setContentEn] = useState<ProjectContentBlock[]>(
  () => normalizeProjectContent(project.content_en, "en")
);
  const [tools, setTools] = useState((project.tools ?? []).join(", "));
  const [githubUrl, setGithubUrl] = useState(project.github_url ?? "");
  const [demoUrl, setDemoUrl] = useState(project.demo_url ?? "");
  const [featured, setFeatured] = useState(project.featured);
  const [published, setPublished] = useState(project.published);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(
    project.cover_image_url ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Format gambar harus PNG, JPG, atau WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("Ukuran gambar maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    let uploadedImagePath: string | null = null;

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        throw new Error("Akun ini tidak memiliki akses admin.");
      }

      let coverImageUrl = project.cover_image_url;

      if (coverFile) {
        const extensionMap: Record<string, string> = {
          "image/png": "png",
          "image/jpeg": "jpg",
          "image/webp": "webp",
        };

        const extension = extensionMap[coverFile.type];

        if (!extension) {
          throw new Error("Format gambar tidak didukung.");
        }

        const filePath = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(filePath, coverFile, {
            contentType: coverFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload gambar gagal: ${uploadError.message}`);
        }

        uploadedImagePath = filePath;

        const { data: imageData } = supabase.storage
          .from("project-images")
          .getPublicUrl(filePath);

        coverImageUrl = imageData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          title_id: titleId.trim(),
          title_en: titleEn.trim(),
          slug: slug.trim(),
          summary_id: summaryId.trim(),
          summary_en: summaryEn.trim(),
  content_id: contentId,
  content_en: contentEn,
          tools: tools
            .split(",")
            .map((tool) => tool.trim())
            .filter(Boolean),
          github_url: githubUrl.trim() || null,
          demo_url: demoUrl.trim() || null,
          cover_image_url: coverImageUrl,
          featured,
          published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (updateError) {
        // Hapus upload baru jika update database gagal.
        if (uploadedImagePath) {
          await supabase.storage
            .from("project-images")
            .remove([uploadedImagePath]);
        }

        if (updateError.code === "23505") {
          throw new Error("Slug sudah digunakan proyek lain.");
        }

        throw new Error(updateError.message);
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan proyek."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <section className="project-form-section">
        <h2>Informasi Proyek</h2>

        <div className="project-field">
          <label htmlFor="titleId">Judul Bahasa Indonesia</label>
          <input
            id="titleId"
            required
            maxLength={150}
            value={titleId}
            onChange={(e) => setTitleId(e.target.value)}
          />
        </div>

        <div className="project-field">
          <label htmlFor="titleEn">Judul Bahasa Inggris</label>
          <input
            id="titleEn"
            required
            maxLength={150}
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
        </div>

        <div className="project-field">
          <label htmlFor="slug">Slug URL</label>
          <input
            id="slug"
            required
            maxLength={160}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <small>Gunakan huruf kecil, angka, dan tanda hubung.</small>
        </div>

        <div className="project-field">
          <label htmlFor="summaryId">Deskripsi Bahasa Indonesia</label>
          <textarea
            id="summaryId"
            required
            maxLength={500}
            rows={4}
            value={summaryId}
            onChange={(e) => setSummaryId(e.target.value)}
          />
        </div>

        <div className="project-field">
          <label htmlFor="summaryEn">Deskripsi Bahasa Inggris</label>
          <textarea
            id="summaryEn"
            required
            maxLength={500}
            rows={4}
            value={summaryEn}
            onChange={(e) => setSummaryEn(e.target.value)}
          />
        </div>

        <div className="project-field">
          <label htmlFor="tools">Tools / Teknologi</label>
          <input
            id="tools"
            required
            value={tools}
            onChange={(e) => setTools(e.target.value)}
          />
          <small>Pisahkan dengan koma, misalnya Linux, Wireshark.</small>
        </div>
      </section>

      <section className="project-form-section">
        <h2>Thumbnail Proyek</h2>

        <div className="project-field">
          <label htmlFor="coverImage">Pilih gambar</label>
          <input
            id="coverImage"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleCoverChange}
            disabled={saving}
          />
          <small>PNG, JPG, atau WebP. Maksimal 5 MB.</small>
        </div>

        {coverPreview && (
          <div className="project-cover-preview">
            <p>Pratinjau thumbnail</p>
            <img
              src={coverPreview}
              alt="Pratinjau thumbnail proyek"
              style={{
                display: "block",
                width: "100%",
                maxWidth: "420px",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          </div>
        )}
      </section>


      <section className="project-form-section">
        <h2>Konten Proyek — Bahasa Indonesia</h2>
        <ProjectContentEditor
          language="id"
          value={contentId}
          onChange={setContentId}
        />
      </section>

      <section className="project-form-section">
        <h2>Project Content — English</h2>
        <ProjectContentEditor
          language="en"
          value={contentEn}
          onChange={setContentEn}
        />
      </section>
      <section className="project-form-section">
        <h2>Tautan</h2>

        <div className="project-field">
          <label htmlFor="githubUrl">URL GitHub</label>
          <input
            id="githubUrl"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>

        <div className="project-field">
          <label htmlFor="demoUrl">URL Demo</label>
          <input
            id="demoUrl"
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
          />
        </div>
      </section>

      <section className="project-form-section">
        <h2>Pengaturan</h2>

        <label className="project-checkbox">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Jadikan proyek unggulan
        </label>

        <label className="project-checkbox">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publikasikan proyek
        </label>
      </section>

      {errorMessage && (
        <p className="project-form-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="project-form-actions">
        <Link href="/admin" className="project-cancel-button">
          Batal
        </Link>

        <button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
