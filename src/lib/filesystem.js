import fs from "fs/promises";
import chalk from "chalk";

// Read the contents of a single file.
export const readFile = async (file) => {
  try {
    const data = await fs.readFile(file);
    return await JSON.parse(data);
  } catch (error) {
    console.log(chalk.red(`Error reading file: ${error.message}`));
  }
};

export const deleteFile = async (file) => {
  try {
    fs.unlink(file);
  } catch (error) {
    console.log(chalk.red(`Error deleting file: ${error.message}`));
  }
};

// List files within a single directory.
export const listDir = async (path) => {
  try {
    let files = await fs.readdir(path);
    // Be sure to return only JSON files.
    return files.filter((file) => file.includes(".json"));
  } catch (error) {
    console.log(chalk.red(`Error reading file directory: ${error.message}`));
  }
};

export const createCSV = async (csvData, csvFilename) => {
  // Check if "public" dir already exists. If not, create it.
  try {
    await fs.access("../../public");
  } catch (error) {
    // If an error is thrown, the directory doesn't exist
    if (error.code === "ENOENT") {
      try {
        // Create the directory
        await fs.mkdir("../../public");
        console.log(chalk.green("Public directory created."));
      } catch (error) {
        console.error(chalk.red("Error creating Public directory."), error);
      }
    } else {
      console.error(chalk.red("Error accessing directory."), error);
    }
  }

  // Write CSV content to file
  try {
    await fs.writeFile(`../../public/${csvFilename}`, csvData.join(","));
    console.log(
      chalk.green(
        `CSV file has been successfully created: /public/${csvFilename}`
      )
    );
  } catch (error) {
    console.log(chalk.red("Error writing CSV file:"), error);
  }
};
