// Slug field was not added in the initial migration, so this
// CLI script concatenates a URL-safe title + ID (for uniqueness
// when Artworks have duplicate titles).
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

function migrationFunction(migration, context) {
  migration.transformEntries({
    contentType: "artwork",
    from: ["title", "id"],
    to: ["slug"],
    shouldPublish: true,
    transformEntryForLocale: (fromFields, currentLocale) => {
      // Trim title field to 250 chars so that we can fit inside CF Symbol field.
      const concatenatedTitleAndId = `${fromFields.title?.[
        currentLocale
      ].substring(0, 250)}-${fromFields.id?.[currentLocale]}`;
      const urlSafeStr = slugify(concatenatedTitleAndId);

      return { slug: urlSafeStr };
    },
  });
}
module.exports = migrationFunction;
