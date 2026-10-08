/**
 * Client-safe stand-in for `@sitecore-content-sdk/content/tools`.
 *
 * The real barrel also re-exports Node-only templating (`glob`), which webpack
 * cannot bundle. Generated `.sitecore/import-map.ts` only needs this helper.
 * Keep the merge behavior aligned with Content SDK `tools/codegen/import-map-utils`.
 */
type ImportMapExport = {
  name: string;
};

type ImportEntry = {
  module: string;
  exports: ImportMapExport[];
};

export const combineImportEntries = (
  defaultImportEntries: ImportEntry[],
  generatedImportEntries: ImportEntry[]
): ImportEntry[] => {
  const combinedEntries: ImportEntry[] = [];
  const importMap = new Map<string, ImportEntry>();

  generatedImportEntries.forEach((entry) => {
    importMap.set(entry.module, entry);
  });

  defaultImportEntries.forEach((defaultEntry) => {
    const mapEntry = importMap.get(defaultEntry.module);

    if (mapEntry) {
      defaultEntry.exports.forEach((defaultExportsEntry) => {
        if (!mapEntry.exports.some((item) => item.name === defaultExportsEntry.name)) {
          mapEntry.exports.push(defaultExportsEntry);
        }
      });
    } else {
      importMap.set(defaultEntry.module, defaultEntry);
    }
  });

  importMap.forEach((value) => {
    combinedEntries.push(value);
  });

  return combinedEntries;
};
