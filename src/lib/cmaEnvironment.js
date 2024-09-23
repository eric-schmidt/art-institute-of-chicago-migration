import dotenv from 'dotenv';
import contentful from 'contentful-management';

// Init dotenv.
dotenv.config();

// Init Contentful client/environment.
export const environment = await new contentful.createClient({
  accessToken: process.env.CONTENTFUL_CMA_TOKEN,
  // @see https://github.com/contentful/contentful-management.js?tab=readme-ov-file#throttle-default-0
  throttle: '10%', // 10% of rate limit. Can also set to 'auto' or a fixed number.
})
  .getSpace(process.env.CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID))
  .then((env) => {
    return env;
  });
