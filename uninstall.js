import AdmZip from "adm-zip";
import { execSync } from "child_process";
import download from "download";
import fs from "fs-extra";
import os from "os";
import path from "path";
import format from "string-template";

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

function deleteFileIfExists(filename) {
  if (fs.existsSync(filename)) {
    fs.unlink(filename, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return;
      }
      console.log("File deleted successfully: " + filename);
    });
  } else {
    console.log(
      "The file does not exist, so it cannot be deleted: " + filename
    );
  }
}

function getGlobalPath() {
  const userAgent = process.env.npm_config_user_agent;
  console.log("user agent: " + userAgent);

  if (userAgent) {
    if (userAgent.includes("pnpm")) {
      return execSync("pnpm root -g").toString().trim();
    } else if (userAgent.includes("yarn")) {
      return execSync("yarn global dir").toString().trim();
    } else if (userAgent.includes("bun")) {
      //return execSync("bun pm bin -g").toString().trim();
      return path.join(os.homedir(), "/.bun/bin");
    } else if (userAgent.includes("deno")) {
      const infoJson = execSync("deno info --json").toString().trim();
      const info = JSON.parse(infoJson);
      return info?.config?.cache?.global;
    } else {
      return path.join(process.env.APPDATA, "npm");
    }
  } else {
    return path.join(process.env.APPDATA, "npm");
  }
}

start().catch((err) => console.error(err));
