import fs from 'fs/promises';

// Read the contents of a single file.
export const readFile = async (file) => {
  try {
    const data = await fs.readFile(file);
    return await data.toString();
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
};

// List files within a single directory.
export const listDir = async (path) => {
  try {
    return await fs.readdir(path);
  } catch (error) {
    console.error(`Error reading file directory: ${error.message}`);
  }
};
