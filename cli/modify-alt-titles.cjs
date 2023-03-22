// Update Artworks content type to leverage a short text (list) instead of
// an object field. Expand/contract handled via Merge app, so this is just
// transforming the field data.
module.exports = function (migration) {
  migration.transformEntries({
    contentType: "artwork",
    from: ["alternateTitles"],
    to: ["additionalTitles"],
    transformEntryForLocale: function (fromFields, currentLocale) {
      // First, make sure source field has data to avoid errors.
      if (fromFields.alternateTitles) {
        return { additionalTitles: fromFields.alternateTitles[currentLocale] };
      }
    },
  });
};
