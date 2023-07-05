import chalk from "chalk";
import TurndownService from "turndown";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { environment } from "./cmaEnvironment.js";
import { getFieldMapping } from "../migrations/migrationMapping.js";
import { getExistingAsset, getExistingEntry } from "./findInContentful.js";

// Turn this to false when testing for quicker/easier deletion of test content.
const PUBLISH_CONTENT = true;

// Migrate entries using data from parsed files.
// 'uuid' is the key from the parsed file that is used for
// uniqueness for the particular content type being migrated.
export const migrateEntry = async (type, data, uuid) => {
  // Get existing if it exists and return it,
  // otherwise create and return it.
  const existingEntry = await getExistingEntry(type, data[uuid]);
  return existingEntry
    ? {
        sys: {
          type: "Link",
          linkType: "Entry",
          id: existingEntry.sys.id,
        },
      }
    : await environment
        .createEntry(type, await getFieldMapping(type, data))
        .then((entry) => {
          if (PUBLISH_CONTENT) {
            entry.publish();
          }
          console.log(
            chalk.green(
              `Entry (${type}) created: https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/entries/${entry.sys.id}`
            )
          );
          return {
            sys: {
              type: "Link",
              linkType: "Entry",
              id: entry.sys.id,
            },
          };
        })
        .catch(console.error);
};

export const migrateAsset = async (type, data, uuid) => {
  const existingAsset = await getExistingAsset(data[uuid]);
  return existingAsset
    ? {
        sys: {
          type: "Link",
          linkType: "Asset",
          id: existingAsset.sys.id,
        },
      }
    : await environment
        .createAsset(await getFieldMapping(type, data))
        .then((asset) => asset.processForAllLocales())
        .then((asset) => {
          if (PUBLISH_CONTENT) {
            asset.publish();
          }
          console.log(
            chalk.green(
              `Asset created: https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/assets/${asset.sys.id}`
            )
          );
          return {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: asset.sys.id,
            },
          };
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
