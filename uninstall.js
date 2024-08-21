import path from "path";
import { deleteFileIfExists, getGlobalPath } from "./library";

async function start() {
  const app = "mousejiggler";

  // Move all files from the temp unzipped directory to the destination directory
  console.log("Deleting runner files");
  const globalPath = getGlobalPath();

  const cmdFilename = path.join(globalPath, `${app}.cmd`);
  deleteFileIfExists(cmdFilename);

  const ps1Filename = path.join(globalPath, `${app}.ps1`);
  deleteFileIfExists(ps1Filename);
}

start().catch((err) => console.error(err));
