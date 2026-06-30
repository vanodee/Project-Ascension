---
name: scaffold-sanity-schema
description: Scaffold a new Sanity document type for the Ascension parish website, following the project's schema conventions and Studio config patterns.
disable-model-invocation: false
---

When asked to scaffold a new Sanity document type (or when `/scaffold-sanity-schema` is invoked with `$ARGUMENTS` naming the type), do the following:

1. **Identify the document type** from `$ARGUMENTS` or the user's request. If not specified, ask.

2. **Check the existing schema** — read `sanity/schemaTypes/` (or `sanity/schemas/`) to understand the existing pattern for field definitions, portable text blocks, slug fields, and how references to other types are declared.

3. **Create the schema file** at the correct path (e.g., `sanity/schemaTypes/<typeName>.ts`). Follow these rules:
   - Use TypeScript strict mode — no `any` types.
   - Include a `slug` field (auto-generated from the title) for all collection types. Singletons do not need a slug.
   - Announcements must include `expiryDate` (datetime) and `pinned` (boolean, default false).
   - Homilies must include a reference to `clergyMember` for the author field.
   - All image fields must require alt text (`validation: Rule => Rule.required()` on the `alt` field) — this is a WCAG 2.1 AA requirement.
   - Images must use the Sanity native `image` type (with `hotspot: true` and a required `alt` string field). Audio must use the Sanity native `file` type with `options: { accept: 'audio/*' }`. Never store media as a plain `url` string field — always use the asset pipeline so files are served from `cdn.sanity.io`.
   - Use Portable Text (`defineArrayMember({ type: 'block' })`) for any rich-text body fields.

4. **Register the type** — add it to the `schemaTypes` array in `sanity/schemaTypes/index.ts` (or equivalent entry point).

5. **Add Studio structure** (optional, only if the type needs a custom desk structure) — update `sanity.config.ts` if the type is a singleton (singletons need `S.document()` views rather than list items).

6. **Summarize** what was created and remind the user to run `npx sanity@latest dev` to verify the schema in Sanity Studio.
