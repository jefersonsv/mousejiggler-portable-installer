import { execSync } from "child_process";
import fs from "fs-extra";
import os from "os";
import path from "path";

export function getGlobalPath() {
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

export function moveFiles(unzippedPath, appGlobalPath) {
  fs.readdir(unzippedPath, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const sourcePath = path.join(unzippedPath, file);
      const destPath = path.join(appGlobalPath, file);

      // Move the file
      fs.move(sourcePath, destPath, { overwrite: true }, (err) => {
        if (err) throw err;
        console.log(`Moved: ${file}`);
      });
    });
  });
}

export function saveFile(cmdFilename, cmd) {
  fs.writeFile(cmdFilename, cmd, (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("File has been created");
    }
  });
}

export function deleteFileIfExists(filename) {
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
