# React component standards (rule 03)

The full standard is `react-component-guidelines.md` in this folder; read it first. Summary of the non-negotiables for this app:

- Components go in `src/components/pagecontent/` (or `pagestructure/`, `navigation/`, `utilities/`), PascalCase, one per file.
- Register in both `.sitecore/component-map.ts` and `.sitecore/component-map.client.ts`.
- Named exports only (`Default` plus variants), never `export default`.
- Props extend `ComponentProps` from `lib/component-props`; wrapper uses `params.styles` and `params.RenderingIdentifier`.
- Every authorable field uses `Text`, `RichText`, `NextImage` or `Link` from `@sitecore-content-sdk/nextjs`; keep fields visible in edit mode.
- Style like the neighbouring components: Bootstrap layout, Sass partials, site theme variables. No shadcn/ui, no `@/` imports.
- Handle missing data with optional chaining; return the empty-state fallback, never throw.
- Follow the repository's existing pattern when it differs, and keep Sitecore editability intact.
