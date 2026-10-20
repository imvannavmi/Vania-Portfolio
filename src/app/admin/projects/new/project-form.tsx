
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProjectForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [summaryId, setSummaryId] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [tools, setTools] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleCoverChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Pilih file gambar yang valid.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Ukuran gambar maksimal 5 MB.");
    return;
  }

  setError("");
  setCoverFile(file);
  setCoverPreview(URL.createObjectURL(file));
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const supabase = createClient();

      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Sesi login berakhir. Silakan login kembali.");
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        throw new Error("Akun ini tidak memiliki akses admin.");
      }

      let coverImageUrl: string | null = null;

if (coverFile) {
  const extension = coverFile.name.split(".").pop()?.toLowerCase();

  const allowedExtensions = ["png", "jpg", "jpeg", "webp"];

  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error("Format gambar harus PNG, JPG, atau WebP.");
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

  const { data: imageData } = supabase.storage
    .from("project-images")
    .getPublicUrl(filePath);

  coverImageUrl = imageData.publicUrl;
}

      const finalSlug = makeSlug(slug || titleId);

      if (!finalSlug) {
        throw new Error("Slug proyek tidak boleh kosong.");
      }

      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          cover_image_url: coverImageUrl,
          title_id: titleId.trim(),
          title_en: titleEn.trim(),
          slug: finalSlug,
          summary_id: summaryId.trim(),
          summary_en: summaryEn.trim(),
          tools: tools.split(",").map((item) => item.trim()).filter(Boolean),
          github_url: githubUrl.trim() || null,
          demo_url: demoUrl.trim() || null,
          published,
          featured,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("Slug sudah digunakan. Pilih slug yang berbeda.");
        }
        throw new Error(insertError.message);
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan proyek.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <section className="project-form-section">
        <p className="admin-eyebrow">01 / BASIC INFORMATION</p>
        <h2>Informasi Proyek</h2>

        <div className="project-form-grid">
          <div className="project-field">
            <label htmlFor="titleId">Judul (Indonesia) *</label>
            <input
              id="titleId"
              value={titleId}
              onChange={(e) => {
                setTitleId(e.target.value);
                if (!slug) setSlug(makeSlug(e.target.value));
              }}
              required
              maxLength={150}
              placeholder="Contoh: Sistem Monitoring Jaringan"
            />
          </div>

          <div className="project-field">
            <label htmlFor="titleEn">Title (English) *</label>
            <input
              id="titleEn"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
              maxLength={150}
              placeholder="Example: Network Monitoring System"
            />
          </div>
        </div>

        <div className="project-field">
          <label htmlFor="slug">Slug URL *</label>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(makeSlug(e.target.value))}
            required
            maxLength={160}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="sistem-monitoring-jaringan"
          />
          <small>Digunakan sebagai identitas URL proyek.</small>
        </div>

        <div className="project-form-grid">
          <div className="project-field">
            <label htmlFor="summaryId">Deskripsi singkat (Indonesia) *</label>
            <textarea
              id="summaryId"
              value={summaryId}
              onChange={(e) => setSummaryId(e.target.value)}
              required
              maxLength={500}
              rows={4}
              placeholder="Jelaskan proyekmu dalam beberapa kalimat."
            />
          </div>

          <div className="project-field">
            <label htmlFor="summaryEn">Short summary (English) *</label>
            <textarea
              id="summaryEn"
              value={summaryEn}
              onChange={(e) => setSummaryEn(e.target.value)}
              required
              maxLength={500}
              rows={4}
              placeholder="Describe your project briefly."
            />
          </div>
        </div>
      </section>

      <section className="project-form-section">
  <p className="admin-eyebrow">02 / PROJECT THUMBNAIL</p>
  <h2>Thumbnail Proyek</h2>

  <div className="project-field">
    <label htmlFor="coverImage">Gambar sampul</label>
    <input
      id="coverImage"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      onChange={handleCoverChange}
    />
    <small>Format PNG, JPG, atau WebP. Maksimal 5 MB.</small>
  </div>

  {coverPreview && (
    <div className="project-cover-preview">
      <img
        src={coverPreview}
        alt="Pratinjau thumbnail proyek"
        style={{
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
        <p className="admin-eyebrow">02 / TECH STACK</p>
        <h2>Tools & Links</h2>

        <div className="project-field">
          <label htmlFor="tools">Tools / teknologi *</label>
          <input
            id="tools"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            required
            placeholder="Linux, Python, Wireshark"
          />
          <small>Pisahkan setiap tools dengan koma.</small>
        </div>

        <div className="project-form-grid">
          <div className="project-field">
            <label htmlFor="github">Link GitHub (opsional)</label>
            <input
              id="github"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>

          <div className="project-field">
            <label htmlFor="demo">Link demo (opsional)</label>
            <input
              id="demo"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
      </section>

      <section className="project-form-section">
        <p className="admin-eyebrow">03 / VISIBILITY</p>
        <h2>Publikasi</h2>

        <label className="project-checkbox">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span>
            <strong>Featured project</strong>
            <small>Tandai sebagai proyek unggulan.</small>
          </span>
        </label>

        <label className="project-checkbox">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span>
            <strong>Publikasikan sekarang</strong>
            <small>Jika tidak dicentang, proyek disimpan sebagai draft.</small>
          </span>
        </label>
      </section>

      {error && <p className="project-form-error">{error}</p>}

      <div className="project-form-actions">
        <button
          type="button"
          className="project-cancel-button"
          onClick={() => router.push("/admin")}
          disabled={saving}
        >
          Batal
        </button>
        <button type="submit" className="admin-primary-link" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Proyek →"}
        </button>
      </div>
    </form>
  );
}
