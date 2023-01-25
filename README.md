# Artwork Migration

## Overview

Migration scripts for migrating data from the [Art Institute of Chicago API](https://api.artic.edu/docs/#introduction) to a Contentful Space.

## Instructions

1. Download the [data dump](https://github.com/art-institute-of-chicago/api-data) and place at the root of this repository in a directory called `artic-api-data`. For example, the Artworks JSON files should be located at `/artic-api-data/json/artworks`
2. Create a new blank space.
3. Import the demo content model via `contentful space import --space-id <YOUR SPACE ID> --environment-id <YOUR ENVIRONMENT ID> content-model.json`
4. Copy `.env.example` and rename it to `.env`.
5. Fill in the environment variables using data from your Contentful space.
6. Run `npm install` to install all dependencies.
7. From your terminal run `node index.js`, which will kick off the migration.
