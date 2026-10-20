
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Locale = "id" | "en";


const content = {
  id: {
    availability: "TERBUKA UNTUK PELUANG IT",
    greeting: "Halo, saya",
    role: "Computer Engineering | IT & Cybersecurity",
    intro:
      "Saya lulusan Teknik Komputer dengan pengalaman magang di bidang pengembangan web, jaringan komputer, dan hardware. Saya tertarik mengembangkan solusi teknologi serta memperdalam kemampuan IT dan cybersecurity melalui praktik dan proyek nyata.",
    projects: "Lihat Proyek",
    about: "Tentang Saya",
    section: "PROYEK & DOKUMENTASI",
    sectionTitle: "Belajar. Membangun. Mengamankan.",
    sectionDesc:
      "Dokumentasi proyek, eksperimen teknis, dan proses pemecahan masalah di bidang teknologi.",
    empty: "Belum ada proyek yang dipublikasikan.",
    experience: "Pengalaman",
    experienceDesc:
      "Pengalaman magang dan penerapan keterampilan teknis di lingkungan kerja.",
    skills: "Keahlian",
    skillsDesc:
      "Bidang teknologi yang pernah saya gunakan dan terus saya kembangkan.",
    aboutDesc:
      "Saya memiliki ketertarikan pada pengembangan sistem, infrastruktur IT, jaringan komputer, dan keamanan siber. Melalui pengalaman magang dan proyek praktis, saya ingin memperkuat kemampuan analisis, troubleshooting, serta pengembangan solusi teknologi.",
    footer: "Terus belajar, bereksperimen, dan berkembang di bidang teknologi.",
  },
  en: {
    availability: "OPEN TO IT OPPORTUNITIES",
    greeting: "Hello, I'm",
    role: "Computer Engineering | IT & Cybersecurity",
    intro:
      "Computer Engineering graduate with internship experience in web development, computer networking, and hardware. Interested in building technology solutions and developing IT and cybersecurity skills through hands-on practice and practical projects.",
    projects: "Explore Projects",
    about: "About Me",
    section: "PROJECTS & DOCUMENTATION",
    sectionTitle: "Learn. Build. Secure.",
    sectionDesc:
      "A collection of technical projects, experiments, and problem-solving processes in technology.",
    empty: "No projects have been published yet.",
    experience: "Experience",
    experienceDesc:
      "Internship experience and practical application of technical skills in professional environments.",
    skills: "Skills",
    skillsDesc:
      "Technology areas I have worked with and continue to develop.",
    aboutDesc:
      "I'm interested in system development, IT infrastructure, computer networking, and cybersecurity. Through internships and hands-on projects, I aim to strengthen my analytical thinking, troubleshooting, and technology solution development skills.",
    footer: "Always learning, experimenting, and growing in technology.",
  },
} satisfies Record<Locale, Record<string, string>>;


export function generateStaticParams() {
  return [{ locale: "id" }, { locale: "en" }];
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "id" && locale !== "en") {
    notFound();
  }

  const t = content[locale];
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "id, title_id, title_en, slug, summary_id, summary_en, tools, github_url, demo_url, featured, cover_image_url"
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase projects error:", error);
    throw new Error("Gagal memuat proyek dari database.");
  }

  return (
    <main className="min-h-screen">
      <header className="site-header">
        <Link href={`/${locale}`} className="brand">
          <span className="brand-mark">{"</>"}</span>
          <span>
            cyber<span className="accent">.lab</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#projects">{t.projects}</a>
          <a href="#about">{t.about}</a>

          <div className="language-switch">
            <Link
              href="/id"
              aria-current={locale === "id" ? "page" : undefined}
              className={locale === "id" ? "active" : ""}
            >
              ID
            </Link>
            <span>/</span>
            <Link
              href="/en"
              aria-current={locale === "en" ? "page" : undefined}
              className={locale === "en" ? "active" : ""}
            >
              EN
            </Link>
          </div>
        </nav>
      </header>

      <section className="hero container">
        <div className="terminal-label">
          <span className="status-dot" />
          {t.availability}
        </div>

        <p className="eyebrow">{"// SYSTEM PROFILE"}</p>

        <h1>
          {t.greeting}
          <br />
          <span className="accent">Vania Bunga Febrina.</span>
        </h1>

        <h2>{t.role}</h2>
        <p className="hero-description">{t.intro}</p>

        <div className="hero-actions">
          <a className="button-primary" href="#projects">
            {t.projects} <span aria-hidden="true">↗</span>
          </a>
          <a className="button-secondary" href="#about">
            {t.about}
          </a>
        </div>

        <div className="hero-meta">
          <span>FOCUS: IT / CYBERSECURITY</span>
          <span>MODE: LEARN & BUILD</span>
        </div>
      </section>

      <section id="projects" className="section container">
        <p className="eyebrow">{t.section}</p>
        <h2 className="section-title">{t.sectionTitle}</h2>
        <p className="section-description">{t.sectionDesc}</p>

        {!projects || projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{"[ _ ]"}</span>
            <p>{t.empty}</p>
            <span className="muted">
              {"// Your documented work will appear here."}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {projects.map((project) => {
              const title =
                (locale === "id" ? project.title_id : project.title_en) ||
                project.title_id;

              const summary =
                (locale === "id"
                  ? project.summary_id
                  : project.summary_en) || project.summary_id;

              return (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                >
                  {project.cover_image_url && (
                    <div className="aspect-video w-full overflow-hidden border-b border-white/10 bg-black/20">
                      <img
                        src={project.cover_image_url}
                        alt={`Thumbnail ${title}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {project.featured && (
                      <p className="mb-3 text-xs tracking-widest text-emerald-400">
                        ★ FEATURED PROJECT
                      </p>
                    )}

                    <h3 className="mb-3 text-xl font-semibold">
                      {title}
                    </h3>

                    <p className="mb-5 leading-7 text-gray-400">
                      {summary}
                    </p>

                    {project.tools && project.tools.length > 0 && (
                      <div className="mb-5 flex flex-wrap gap-2">
                        {project.tools.map((tool: string) => (
                          <span
                            key={tool}
                            className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <Link
                        href={`/${locale}/projects/${project.slug}`}
                        className="text-emerald-400 hover:underline"
                      >
                        {locale === "id"
                          ? "Lihat detail ↗"
                          : "View details ↗"}
                      </Link>

                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:underline"
                        >
                          GitHub ↗
                        </a>
                      )}

                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:underline"
                        >
                          Demo ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="about" className="section container about-section">
        <p className="eyebrow">{"// ABOUT ME"}</p>
        <h2 className="section-title">{t.about}</h2>
        <p className="section-description">{t.aboutDesc}</p>
      </section>

      
<section id="experience" className="section container">
  <p className="eyebrow">{"// EXPERIENCE"}</p>
  <h2 className="section-title">{t.experience}</h2>
  <p className="section-description">{t.experienceDesc}</p>

  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <p className="mb-2 text-xs tracking-widest text-emerald-400">
        MAR 2025 — AUG 2025
      </p>
      <h3 className="text-xl font-semibold">Full Stack Developer Intern</h3>
      <p className="mt-1 text-gray-400">PT Winnicode Garuda Teknologi</p>
      <p className="mt-4 leading-7 text-gray-300">
        Mengembangkan platform mentoring berbasis web, termasuk antarmuka
        React, backend Node.js dan Express, database SQLite, serta pengujian
        integrasi sistem.
      </p>
    </article>

    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <p className="mb-2 text-xs tracking-widest text-emerald-400">
        SEP 2025 — DEC 2025
      </p>
      <h3 className="text-xl font-semibold">Hardware & Mechanical Design Intern</h3>
      <p className="mt-1 text-gray-400">PT Javadwipa Duta Mandiri</p>
      <p className="mt-4 leading-7 text-gray-300">
        Mendukung proyek Battery Management System (BMS) melalui studi
        kelayakan komponen, desain casing 3D, validasi awal pembacaan sensor,
        dan dukungan desain routing PCB.
      </p>
    </article>
  </div>
</section>

<section id="skills" className="section container">
  <p className="eyebrow">{"// TECHNICAL SKILLS"}</p>
  <h2 className="section-title">{t.skills}</h2>
  <p className="section-description">{t.skillsDesc}</p>

  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="mb-4 text-lg font-semibold">Web Development</h3>
      <div className="flex flex-wrap gap-2">
        {["React.js", "Tailwind CSS", "Node.js", "Express.js", "PHP", "MySQL", "SQLite"].map((skill) => (
          <span key={skill} className="rounded-md border border-white/10 px-3 py-2 text-sm text-gray-300">
            {skill}
          </span>
        ))}
      </div>
    </article>

    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="mb-4 text-lg font-semibold">IT & Networking</h3>
      <div className="flex flex-wrap gap-2">
        {["Network Troubleshooting", "DHCP", "LAN Infrastructure", "Linux", "IP CCTV", "Hardware Support"].map((skill) => (
          <span key={skill} className="rounded-md border border-white/10 px-3 py-2 text-sm text-gray-300">
            {skill}
          </span>
        ))}
      </div>
    </article>

    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:col-span-2">
      <h3 className="mb-4 text-lg font-semibold">Cybersecurity — Currently Learning</h3>
      <p className="leading-7 text-gray-300">
        Building foundational knowledge in Linux security, network security,
        security log analysis, and system hardening through hands-on labs.
      </p>
    </article>
  </div>
</section>


      <footer className="site-footer container">
        <span>© 2026 cyber.lab</span>
        <span>{t.footer}</span>
      </footer>
    </main>
  );
}
