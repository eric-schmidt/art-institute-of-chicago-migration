import chalk from "chalk";
import TurndownService from "turndown";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { environment } from "../lib/contentfulEnvironment.js";
import { getFieldMapping } from "../mappings/migrationMapping.js";

// Turn this to false when testing for quicker/easier deletion of test content.
const PUBLISH_CONTENT = true;

// Create a new entry in Contentful.
export const createNewAsset = async (type, data) => {
  environment
    .createAsset(await getFieldMapping(type, data))
    .then((asset) => asset.processForAllLocales())
    .then((asset) => {
      if (PUBLISH_CONTENT) {
        asset.publish();
      }
      console.log(chalk.green(`Asset created: ${asset.sys.id}`));
    })
    .catch(console.error);
};

// Update an existing entry that has already been migrated, using updated field values.
export const updateExistingAsset = async (type, assetId, data) => {
  let updatedData = await getFieldMapping(type, data);

  return await environment
    .getAsset(assetId)
    .then((asset) => {
      asset.fields = updatedData.fields;
      asset.metadata = updatedData.metadata;
      return asset.update();
    })
    .then((asset) => asset.processForAllLocales())
    .then((asset) => {
      if (PUBLISH_CONTENT) {
        asset.publish();
      }
      console.log(chalk.yellow(`Asset updated: ${asset.sys.id}`));
    })
    .catch(console.error);
};

// Create a new entry in Contentful.
export const createNewEntry = async (type, data) => {
  environment
    .createEntry(type, await getFieldMapping(type, data))
    .then((entry) => {
      if (PUBLISH_CONTENT) {
        entry.publish();
      }
      console.log(chalk.green(`Entry (${type}) created: ${entry.sys.id}`));
    })
    .catch(console.error);
};

// Update an existing entry that has already been migrated, using updated field values.
export const updateExistingEntry = async (type, entryId, data) => {
  let updatedData = await getFieldMapping(type, data);

  return await environment
    .getEntry(entryId)
    .then((entry) => {
      entry.fields = updatedData.fields;
      entry.metadata = updatedData.metadata;
      return entry.update();
    })
    .then((entry) => {
      if (PUBLISH_CONTENT) {
        entry.publish();
      }
      console.log(
        chalk.yellow(
          `Entry (${entry.sys.contentType.sys.id}) updated: ${entry.sys.id}`
        )
      );
      return entry.sys.id;
    })
    .catch(console.error);
};

// Init turndown for converting HTML into Markdown.
const turndownService = new TurndownService();

// Create Contentful Rich Text data from HTML.
export const createRichText = async (data) => {
  if (!data) {
    return null;
  }

  // First, convert HTML to Markdown.
  const markdown = await turndownService.turndown(data);

  // Next, convert Markdown to Rich Text.
  return await richTextFromMarkdown(markdown, async (node) => {
    // TODO: Processing for unsupported node types goes here.
    // E.g. creating imageWrappers for WYSIWYG images.
  });
};
