
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Locale = "id" | "en";

type ProjectContentBlock = {
  id?: string;
  type?: string;
  heading?: string;
  title?: string;
  body?: string;
  text?: string;
  content?: string;
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  language?: string;
  tests?: {
    scenario: string;
    expected: string;
    actual: string;
    status: "passed" | "failed" | "pending";
  }[];
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (locale !== "id" && locale !== "en") {
    notFound();
  }

  const lang = locale as Locale;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      "id, title_id, title_en, slug, summary_id, summary_en, content_id, content_en, tools, github_url, demo_url, featured, cover_image_url"
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error("Gagal memuat detail proyek.");
  }

  if (!project) {
    notFound();
  }

  const title =
    (lang === "id" ? project.title_id : project.title_en) ||
    project.title_id;

  const summary =
    (lang === "id" ? project.summary_id : project.summary_en) ||
    project.summary_id;

  const rawContent =
    lang === "id" ? project.content_id : project.content_en;

  const blocks: ProjectContentBlock[] = Array.isArray(rawContent)
    ? rawContent.filter(
        (item): item is ProjectContentBlock =>
          typeof item === "object" && item !== null
      )
    : [];

  return (
    <main className="min-h-screen">
      <header className="site-header">
        <Link href={`/${lang}`} className="brand">
          <span className="brand-mark">{"</>"}</span>
          <span>
            cyber<span className="accent">.lab</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link href={`/${lang}#projects`}>
            {lang === "id" ? "Semua Proyek" : "All Projects"}
          </Link>

          <div className="language-switch">
            <Link
              href={`/id/projects/${slug}`}
              className={lang === "id" ? "active" : ""}
            >
              ID
            </Link>
            <span>/</span>
            <Link
              href={`/en/projects/${slug}`}
              className={lang === "en" ? "active" : ""}
            >
              EN
            </Link>
          </div>
        </nav>
      </header>

      <article className="section container">
        <Link
          href={`/${lang}#projects`}
          className="text-sm text-emerald-400 hover:underline"
        >
          ← {lang === "id" ? "Kembali ke proyek" : "Back to projects"}
        </Link>

        {/* Banner gambar proyek */}
        {project.cover_image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <img
              src={project.cover_image_url}
              alt={`Banner ${title}`}
              className="block aspect-[16/7] w-full object-cover"
              fetchPriority="high"
            />
          </div>
        )}

        {project.featured && (
          <p className="eyebrow mt-8">★ FEATURED PROJECT</p>
        )}

        <p className="eyebrow mt-8">
          {lang === "id" ? "DOKUMENTASI PROYEK" : "PROJECT DOCUMENTATION"}
        </p>

        <h1 className="section-title">{title}</h1>
        <p className="section-description">{summary}</p>

        {project.tools && project.tools.length > 0 && (
          <div className="my-8 flex flex-wrap gap-2">
            {project.tools.map((tool: string) => (
              <span
                key={tool}
                className="rounded-md border border-white/10 px-3 py-2 text-sm text-gray-300"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {(project.github_url || project.demo_url) && (
          <div className="my-8 flex flex-wrap gap-4">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary"
              >
                GitHub ↗
              </a>
            )}

            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary"
              >
                Demo ↗
              </a>
            )}
          </div>
        )}

        <div className="mt-10 space-y-8">
          {blocks.map((block, index) => {
            const heading = block.heading || block.title;
            const body = block.body || block.text || block.content;
            const items = Array.isArray(block.items)
              ? block.items.filter(
                  (item): item is string =>
                    typeof item === "string" && item.trim().length > 0
                )
              : [];
            const tests = Array.isArray(block.tests) ? block.tests : [];

            const safeImageUrl = (() => {
              if (!block.imageUrl) return null;

              try {
                const url = new URL(block.imageUrl);
                return url.protocol === "https:" || url.protocol === "http:"
                  ? url.href
                  : null;
              } catch {
                return null;
              }
            })();

            return (
              <section
                key={block.id || `${block.type || "paragraph"}-${index}`}
                className="min-w-0"
              >
                {heading && (
                  <h2 className="mb-3 text-xl font-semibold">
                    {heading}
                  </h2>
                )}

                {block.type === "list" && (
                  <ul className="list-disc space-y-2 pl-6 leading-8 text-gray-300">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}

                {block.type === "steps" && (
                  <ol className="list-decimal space-y-2 pl-6 leading-8 text-gray-300">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ol>
                )}

                {block.type === "code" && body && (
                  <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-7 text-gray-200">
                    <code>{body}</code>
                  </pre>
                )}

                {block.type === "image" && safeImageUrl && (
                  <figure className="space-y-2">
                    <img
                      src={safeImageUrl}
                      alt={block.imageAlt || heading || "Project image"}
                      loading="lazy"
                      className="h-auto max-h-[600px] w-full rounded-xl border border-white/10 object-contain"
                    />
                    {block.imageAlt && (
                      <figcaption className="text-sm leading-6 text-gray-400">
                        {block.imageAlt}
                      </figcaption>
                    )}
                  </figure>
                )}

                {block.type === "test-results" && tests.length > 0 && (
                  <div className="space-y-3">
                    {tests.map((test, testIndex) => {
                      const status =
                        test.status === "passed" ||
                        test.status === "failed" ||
                        test.status === "pending"
                          ? test.status
                          : "pending";

                      const statusLabel =
                        lang === "id"
                          ? status === "passed"
                            ? "Berhasil"
                            : status === "failed"
                              ? "Gagal"
                              : "Belum diuji"
                          : status === "passed"
                            ? "Passed"
                            : status === "failed"
                              ? "Failed"
                              : "Pending";

                      return (
                        <div
                          key={testIndex}
                          className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-medium text-gray-100">
                              {test.scenario ||
                                (lang === "id"
                                  ? "Skenario pengujian"
                                  : "Test scenario")}
                            </h3>
                            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-gray-300">
                              {statusLabel}
                            </span>
                          </div>

                          {test.expected && (
                            <p className="whitespace-pre-wrap leading-7 text-gray-300">
                              <strong>
                                {lang === "id"
                                  ? "Hasil yang diharapkan: "
                                  : "Expected: "}
                              </strong>
                              {test.expected}
                            </p>
                          )}

                          {test.actual && (
                            <p className="whitespace-pre-wrap leading-7 text-gray-300">
                              <strong>
                                {lang === "id"
                                  ? "Hasil aktual: "
                                  : "Actual: "}
                              </strong>
                              {test.actual}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {(!block.type ||
                  ![
                    "list",
                    "steps",
                    "code",
                    "image",
                    "test-results",
                  ].includes(block.type)) &&
                  body && (
                    <p className="whitespace-pre-wrap leading-8 text-gray-300">
                      {body}
                    </p>
                  )}
              </section>
            );
          })}
        </div>
      </article>

      <footer className="site-footer container">
        <span>© 2026 cyber.lab</span>
        <span>
          {lang === "id"
            ? "Eksperimen. Analisis. Dokumentasi."
            : "Experiment. Analyze. Document."}
        </span>
      </footer>
    </main>
  );
}
