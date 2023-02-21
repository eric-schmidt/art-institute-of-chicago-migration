import fs from 'fs/promises';
import chalk from 'chalk';

// Read the contents of a single file.
export const readFile = async (file) => {
  try {
    const data = await fs.readFile(file);
    return await JSON.parse(data);
  } catch (error) {
    console.log(chalk.red(`Error reading file: ${error.message}`));
  }
};

// List files within a single directory.
export const listDir = async (path) => {
  try {
    let files = await fs.readdir(path);
    // Be sure to return only JSON files.
    return files.filter((file) => file.includes('.json'));
  } catch (error) {
    console.log(chalk.red(`Error reading file directory: ${error.message}`));
  }
};
