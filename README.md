# Art Institute of Chicago Migration (POC)

## Migration Scripts

Migration scripts for migrating data from the [Art Institute of Chicago API](https://api.artic.edu/docs/#introduction) to a Contentful Space (see `/src/migrations`). Additionally, this repo contains a variety of update scripts, showcasing how schemas can be updated after the fact in an iterative manner (see `/src/updates`).

NOTE: This repo demos migrating content in a "bottom up" manner (i.e. you migrate all children first, then slowly work your way up the parent tree running each migration manually). Other repos showcase a more recursive approach, migrating nested references on the fly.

ADDENDUM: Due to the sheer number of 'artworks', that content type is migrating images recursively, which helps cut down on the number of items that need to be migrated (since we're not migrating alternate images).

### Instructions

1. Download the [data dump](https://github.com/art-institute-of-chicago/api-data) and place at the root of this repository in a directory called `artic-api-data`. For example, the Artworks JSON files should be located at `/artic-api-data/json/artworks`
2. Create a new blank space.
3. Import the demo content model via `contentful space import --space-id <YOUR SPACE ID> --environment-id <YOUR ENVIRONMENT ID> src/content-model.json`
4. Copy `.env.example` and rename it to `.env`.
5. Fill in the environment variables using data from your Contentful space.
6. Run `npm install` to install all dependencies.
7. From your terminal run `node src/migrations/migrate.js --type=[CONTENT TYPE]`, which will kick off the migration for entries. Be sure to see the order of migrations below, since we're running migrations more procedurally.

### Order of migrations

Since migrations are run in a procedural manner, we must ensure that child entries exist before attempting to migrate their parents. Here is the order in which migrations need to run:

1. `node src/migrations/migrate.js --type=artworkType`
2. `node src/migrations/migrate.js --type=categoryTerm`
3. `node src/migrations/migrate.js --type=gallery`
4. `node src/migrations/migrate.js --type=agent`
5. `node src/migrations/migrate.js --type=artwork`

## Update Scripts

Following Agile Deployments best practices, this repo also contains some update scripts for reformatting some of the data after it has all been migrated. Here is a rough breakdown of each script:

- **Orphan tracking/removal**: There is a lot of orphan content within the Art Institute of Chicago API (e.g. Agents or Galleries not linked to a specific Artwork). `src/updates/generate-orphan-report.js` takes a content type ID input and generates a CSV of all orphans of a given type. The CSV contains direct links to the entries within the web app for manual review. Once reviewed, `src/updates/remove-orphans.js` can be run to delete all orphans of a given type, using the generated CSV as a data source.
- **Removing broken references**: A byproduct of the migration process was a number of broken images (mainly due to the buggy Art Institute of Chicago API). This script checks if an Artwork entry is linking to a broken asset reference and generates a report, which can then be used for deletion.
- **Adding slugs**: Initially, a slug field was not added to the Artwork content type. Rather than re-running the 100k entry migration, `src/updates/generate-slugs.js` will iterate through each entry and create a slug. The slug is actually a concatenation of the title + ID, as there are quite a few duplicate titles in the source data.
- **Updating Alternate Title field appearance**: For usability/UX purposes, it was decided that the Alternate Text field should instead be a Short Text (List) field type. This script creates a new field and migrates existing data to this new field type.
