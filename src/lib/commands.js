// Get parameters from command.
// E.g. node entries.js --type=artwork
export const getArguments = () => {
  const argv = process.argv;
  let type;
  if (argv[2]) {
    const param = argv[2].split("=");
    if (param[0] == "--type") {
      type = param[1];
    }
  }
  return { type };
};
