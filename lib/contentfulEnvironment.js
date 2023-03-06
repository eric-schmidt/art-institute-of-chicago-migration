import contentful from "contentful-management";
import dotenv from "dotenv";

// Init dotenv.
dotenv.config();

// Init Contentful client/environment.
export const environment = await new contentful.createClient({
  accessToken: process.env.CONTENTFUL_CMA_TOKEN,
})
  .getSpace(process.env.CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID))
  .then((env) => {
    return env;
  });
