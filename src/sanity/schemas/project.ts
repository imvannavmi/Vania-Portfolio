import {
  defineField,
  defineType,
  defineArrayMember,
} from "sanity";

const localizedString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({
        name: "id",
        title: "Bahasa Indonesia",
        type: "string",
      }),
      defineField({
        name: "en",
        title: "English",
        type: "string",
      }),
    ],
  });

const localizedText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({
        name: "id",
        title: "Bahasa Indonesia",
        type: "text",
        rows: 3,
      }),
      defineField({
        name: "en",
        title: "English",
        type: "text",
        rows: 3,
      }),
    ],
  });

const richText = () =>
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "Heading 2", value: "h2" },
      { title: "Heading 3", value: "h3" },
      { title: "Heading 4", value: "h4" },
      { title: "Quote", value: "blockquote" },
    ],
    lists: [
      { title: "Bullet", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      decorators: [
        { title: "Bold", value: "strong" },
        { title: "Italic", value: "em" },
        { title: "Code", value: "code" },
        { title: "Underline", value: "underline" },
      ],
      annotations: [
        defineArrayMember({
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            defineField({
              name: "href",
              title: "URL",
              type: "url",
              validation: (rule) =>
                rule.uri({
                  scheme: ["http", "https", "mailto"],
                }),
            }),
          ],
        }),
      ],
    },
  });

const localizedContent = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({
        name: "id",
        title: "Dokumentasi Bahasa Indonesia",
        type: "array",
        of: [
          richText(),
          defineArrayMember({
            type: "image",
            options: { hotspot: true },
            fields: [
              defineField({
                name: "caption",
                title: "Caption",
                type: "string",
              }),
            ],
          }),
        ],
      }),
      defineField({
        name: "en",
        title: "English Documentation",
        type: "array",
        of: [
          richText(),
          defineArrayMember({
            type: "image",
            options: { hotspot: true },
            fields: [
              defineField({
                name: "caption",
                title: "Caption",
                type: "string",
              }),
            ],
          }),
        ],
      }),
    ],
  });

export const projectType = defineType({
  name: "project",
  title: "Projects",
  type: "document",

  fields: [
    localizedString("title", "Project Title"),
    defineField({
      name: "slug",
      title: "Project URL Slug",
      type: "slug",
      options: {
        source: "title.id",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),

    localizedText("summary", "Project Summary"),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Cybersecurity", value: "cybersecurity" },
          { title: "Networking", value: "networking" },
          { title: "Software Development", value: "software" },
          { title: "IT Infrastructure", value: "infrastructure" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
        }),
      ],
    }),

    localizedContent("content", "Documentation"),

    defineField({
      name: "tools",
      title: "Tools & Technologies",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),

    defineField({
      name: "githubUrl",
      title: "GitHub Repository",
      type: "url",
    }),

    defineField({
      name: "demoUrl",
      title: "Live Demo",
      type: "url",
    }),

    defineField({
      name: "status",
      title: "Project Status",
      type: "string",
      options: {
        list: [
          { title: "Planned", value: "planned" },
          { title: "In Progress", value: "in-progress" },
          { title: "Completed", value: "completed" },
        ],
        layout: "dropdown",
      },
      initialValue: "in-progress",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "featured",
      title: "Feature on Homepage",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "publishedAt",
      title: "Project Date",
      type: "date",
    }),
  ],
});