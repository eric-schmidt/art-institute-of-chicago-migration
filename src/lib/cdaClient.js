import dotenv from "dotenv";
import contentful from "contentful";

// Init dotenv.
dotenv.config({ path: "../../.env" });

// Init Contentful delivery client.
export const client = await new contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  environment: process.env.CONTENTFUL_ENVIRONMENT_ID,
  accessToken: process.env.CONTENTFUL_CDA_TOKEN,
});
