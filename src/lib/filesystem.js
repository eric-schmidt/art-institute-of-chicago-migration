import fs from "fs/promises";
import chalk from "chalk";

// Read the contents of a single file.
export const readFile = async (file) => {
  try {
    return await fs.readFile(file, "utf8");
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

// Helper function for creating a CSV report of orphans that can later be
// used to cull erroneous entries.
export const createCSV = async ({ data, path, filename }) => {
  // Properly format multidimensional array for output to CSV.
  const csvRows = [];
  data.forEach((row) => {
    csvRows.push(row.join(","));
  });
  const csvString = csvRows.join("\n");

  // Check if dir already exists. If not, create it.
  try {
    await fs.access(path);
  } catch (error) {
    // If an error is thrown, the directory doesn't exist.
    if (error.code === "ENOENT") {
      try {
        // Create the directory
        await fs.mkdir(path);
        console.log(chalk.green(`Directory created: ${path}`));
      } catch (error) {
        console.error(chalk.red(`Error creating directory: ${path}`), error);
      }
    } else {
      console.error(chalk.red(`Error accessing directory: ${path}`), error);
    }
  }

  // Write CSV content to file.
  try {
    await fs.writeFile(`${path}/${filename}.csv`, csvString);
    console.log(
      chalk.green(
        `CSV file has been successfully created: ${path}/${filename}.csv`
      )
    );
  } catch (error) {
    console.log(chalk.red("Error writing CSV file:"), error);
  }
};
