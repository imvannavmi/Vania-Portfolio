"use client";

import { useState } from "react";

export type ProjectContentBlock = {
  id: string;
  type: "paragraph" | "list" | "steps" | "code" | "image" | "test-results";
  heading: string;
  body?: string;
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

type Props = {
  language: "id" | "en";
  value: ProjectContentBlock[];
  onChange: (blocks: ProjectContentBlock[]) => void;
};

const labels = {
  id: {
    title: "Konten detail",
    description: "Susun dokumentasi proyek. Bagian akan ditampilkan sesuai urutan di bawah.",
    add: "Tambah bagian",
    heading: "Judul bagian",
    type: "Tipe konten",
    body: "Isi teks",
    remove: "Hapus",
    up: "Naik",
    down: "Turun",
    item: "Item",
    addItem: "Tambah item",
    imageUrl: "URL gambar",
    imageAlt: "Deskripsi gambar",
    language: "Bahasa kode",
    code: "Kode atau konfigurasi",
    scenario: "Skenario pengujian",
    expected: "Hasil yang diharapkan",
    actual: "Hasil aktual",
    status: "Status",
    paragraph: "Paragraf",
    list: "Daftar",
    steps: "Langkah-langkah",
    codeType: "Kode / konfigurasi",
    image: "Gambar",
    tests: "Hasil pengujian",
    passed: "Berhasil",
    failed: "Gagal",
    pending: "Belum diuji",
  },
  en: {
    title: "Detailed content",
    description: "Build your project documentation. Sections appear in the order shown below.",
    add: "Add section",
    heading: "Section heading",
    type: "Content type",
    body: "Text content",
    remove: "Remove",
    up: "Up",
    down: "Down",
    item: "Item",
    addItem: "Add item",
    imageUrl: "Image URL",
    imageAlt: "Image description",
    language: "Code language",
    code: "Code or configuration",
    scenario: "Test scenario",
    expected: "Expected result",
    actual: "Actual result",
    status: "Status",
    paragraph: "Paragraph",
    list: "List",
    steps: "Steps",
    codeType: "Code / configuration",
    image: "Image",
    tests: "Test results",
    passed: "Passed",
    failed: "Failed",
    pending: "Not tested",
  },
} as const;

function createBlock(
  type: ProjectContentBlock["type"] = "paragraph"
): ProjectContentBlock {
  return {
    id: crypto.randomUUID(),
    type,
    heading: "",
    body: "",
    items: type === "list" || type === "steps" ? [""] : [],
    language: "text",
    imageUrl: "",
    imageAlt: "",
    tests: type === "test-results"
      ? [{ scenario: "", expected: "", actual: "", status: "pending" }]
      : [],
  };
}

export default function ProjectContentEditor({
  language,
  value,
  onChange,
}: Props) {
  const t = labels[language];
  const [newType, setNewType] =
    useState<ProjectContentBlock["type"]>("paragraph");

  function updateBlock(index: number, patch: Partial<ProjectContentBlock>) {
    onChange(
      value.map((block, i) =>
        i === index ? { ...block, ...patch } : block
      )
    );
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;

    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function updateItem(
    index: number,
    itemIndex: number,
    text: string
  ) {
    const items = [...(value[index].items ?? [])];
    items[itemIndex] = text;
    updateBlock(index, { items });
  }

  function updateTest(
    index: number,
    testIndex: number,
    patch: Partial<NonNullable<ProjectContentBlock["tests"]>[number]>
  ) {
    const tests = [...(value[index].tests ?? [])];
    tests[testIndex] = { ...tests[testIndex], ...patch };
    updateBlock(index, { tests });
  }

  return (
    <section className="project-form-section">
      <h2>{t.title}</h2>
      <p className="section-description">{t.description}</p>

      {value.map((block, index) => (
        <article
          key={block.id}
          className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <strong>
              {index + 1}. {t[block.type === "code" ? "codeType" : block.type === "test-results" ? "tests" : block.type]}
            </strong>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={index === 0} onClick={() => moveBlock(index, -1)}>
                {String.fromCharCode(8593)} {t.up}
              </button>
              <button type="button" disabled={index === value.length - 1} onClick={() => moveBlock(index, 1)}>
                {String.fromCharCode(8595)} {t.down}
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                {t.remove}
              </button>
            </div>
          </div>

          <div className="project-field">
            <label htmlFor={`${block.id}-heading`}>{t.heading}</label>
            <input
              id={`${block.id}-heading`}
              value={block.heading}
              maxLength={200}
              onChange={(e) => updateBlock(index, { heading: e.target.value })}
              placeholder={t.heading}
            />
          </div>

          {block.type === "paragraph" && (
            <div className="project-field">
              <label htmlFor={`${block.id}-body`}>{t.body}</label>
              <textarea
                id={`${block.id}-body`}
                rows={5}
                value={block.body ?? ""}
                onChange={(e) => updateBlock(index, { body: e.target.value })}
              />
            </div>
          )}

          {(block.type === "list" || block.type === "steps") && (
            <div className="project-field">
              {(block.items ?? []).map((item, itemIndex) => (
                <div key={`${block.id}-item-${itemIndex}`} className="mb-3 flex gap-2">
                  <input
                    aria-label={`${t.item} ${itemIndex + 1}`}
                    value={item}
                    onChange={(e) => updateItem(index, itemIndex, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateBlock(index, {
                        items: (block.items ?? []).filter((_, i) => i !== itemIndex),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateBlock(index, { items: [...(block.items ?? []), ""] })}
              >
                + {t.addItem}
              </button>
            </div>
          )}

          {block.type === "code" && (
            <>
              <div className="project-field">
                <label htmlFor={`${block.id}-language`}>{t.language}</label>
                <input
                  id={`${block.id}-language`}
                  value={block.language ?? "text"}
                  onChange={(e) => updateBlock(index, { language: e.target.value })}
                  placeholder="bash, javascript, python..."
                />
              </div>
              <div className="project-field">
                <label htmlFor={`${block.id}-code`}>{t.code}</label>
                <textarea
                  id={`${block.id}-code`}
                  rows={8}
                  value={block.body ?? ""}
                  onChange={(e) => updateBlock(index, { body: e.target.value })}
                />
              </div>
            </>
          )}

          {block.type === "image" && (
            <>
              <div className="project-field">
                <label htmlFor={`${block.id}-url`}>{t.imageUrl}</label>
                <input
                  id={`${block.id}-url`}
                  type="url"
                  value={block.imageUrl ?? ""}
                  onChange={(e) => updateBlock(index, { imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="project-field">
                <label htmlFor={`${block.id}-alt`}>{t.imageAlt}</label>
                <input
                  id={`${block.id}-alt`}
                  value={block.imageAlt ?? ""}
                  onChange={(e) => updateBlock(index, { imageAlt: e.target.value })}
                />
              </div>
              <small>Gunakan URL gambar yang sudah tersedia. Bagian ini tidak mengunggah file.</small>
            </>
          )}

          {block.type === "test-results" && (
            <div className="project-field">
              {(block.tests ?? []).map((test, testIndex) => (
                <div key={`${block.id}-test-${testIndex}`} className="mb-5 space-y-2 rounded-lg border border-white/10 p-3">
                  <label>{t.scenario}</label>
                  <input
                    value={test.scenario}
                    onChange={(e) => updateTest(index, testIndex, { scenario: e.target.value })}
                  />
                  <label>{t.expected}</label>
                  <textarea
                    rows={2}
                    value={test.expected}
                    onChange={(e) => updateTest(index, testIndex, { expected: e.target.value })}
                  />
                  <label>{t.actual}</label>
                  <textarea
                    rows={2}
                    value={test.actual}
                    onChange={(e) => updateTest(index, testIndex, { actual: e.target.value })}
                  />
                  <label>{t.status}</label>
                  <select
                    className="project-content-status-select"
                    value={test.status}
                    onChange={(e) =>
                      updateTest(index, testIndex, {
                        status: e.target.value as "passed" | "failed" | "pending",
                      })
                    }
                  >
                    <option value="passed">{t.passed}</option>
                    <option value="failed">{t.failed}</option>
                    <option value="pending">{t.pending}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      updateBlock(index, {
                        tests: (block.tests ?? []).filter((_, i) => i !== testIndex),
                      })
                    }
                  >
                    {t.remove}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateBlock(index, {
                    tests: [
                      ...(block.tests ?? []),
                      { scenario: "", expected: "", actual: "", status: "pending" },
                    ],
                  })
                }
              >
                + {t.addItem}
              </button>
            </div>
          )}
        </article>
      ))}

      <div className="flex flex-wrap gap-3">
        <select
          aria-label={t.type}
          className="project-content-type-select"
          value={newType}
          onChange={(e) => setNewType(e.target.value as ProjectContentBlock["type"])}
        >
          <option value="paragraph">{t.paragraph}</option>
          <option value="list">{t.list}</option>
          <option value="steps">{t.steps}</option>
          <option value="code">{t.codeType}</option>
          <option value="image">{t.image}</option>
          <option value="test-results">{t.tests}</option>
        </select>
        <button
          type="button"
          onClick={() => onChange([...value, createBlock(newType)])}
        >
          + {t.add}
        </button>
      </div>
    </section>
  );
}
