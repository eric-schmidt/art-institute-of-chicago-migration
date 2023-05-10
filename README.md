# Artwork Migration

## Overview

Migration scripts for migrating data from the [Art Institute of Chicago API](https://api.artic.edu/docs/#introduction) to a Contentful Space.

NOTE: This repo demos migrating content in a very procedural manner (i.e. you migrate all children first, then slowly work your way up the parent tree running each migration manually). Other repos showcase a more recursive approach, migrating nested references on the fly.

ADDENDUM: Due to the sheer number of 'artworks', that content type is migrating images recursively, which helps cut down on the number of items that need to be migrated (since we're not migrating alternate images).

## Instructions

1. Download the [data dump](https://github.com/art-institute-of-chicago/api-data) and place at the root of this repository in a directory called `artic-api-data`. For example, the Artworks JSON files should be located at `/artic-api-data/json/artworks`
2. Create a new blank space.
3. Import the demo content model via `contentful space import --space-id <YOUR SPACE ID> --environment-id <YOUR ENVIRONMENT ID> content-model.json`
4. Copy `.env.example` and rename it to `.env`.
5. Fill in the environment variables using data from your Contentful space.
6. Run `npm install` to install all dependencies.
7. From your terminal run `node scripts/migrate.js --type=[CONTENT TYPE]`, which will kick off the migration for entries. Be sure to see the order of migrations below, since we're running migrations more procedurally.

## Order of migrations

Since we're running migrations in a more procedural manner, we need to ensure that child entries exist before attempting to migrate their parents. Here is the order in which migrations need to run:

1. `node scripts/migrate.js --type=artworkType`
2. `node scripts/migrate.js --type=categoryTerm`
3. `node scripts/migrate.js --type=gallery`
4. `node scripts/migrate.js --type=agent`
5. `node scripts/migrate.js --type=artwork`
