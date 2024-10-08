import AdmZip from "adm-zip";
import download from "download";
import fs from "fs-extra";
import os from "os";
import path from "path";
import format from "string-template";
import { getGlobalPath, moveFiles, saveFile } from "./library";

async function start() {
  const app = "mousejiggler";

  const response = await fetch(
    "https://api.github.com/repos/arkane-systems/mousejiggler/releases"
  );

  if (response.ok) {
    const body = await response.json();
    const latest = body[0];
    const tempPath = path.join(os.tmpdir(), `${app}/${latest.name}`);
    const portable = latest.assets.find((w) =>
      w.name.endsWith("-portable.zip")
    );

    if (portable) {
      const tempZipFilename = path.join(tempPath, portable.name);

      // get
      if (!fs.existsSync(tempZipFilename)) {
        console.log("Downloading: " + portable.browser_download_url);
        await download(portable.browser_download_url, tempPath, {
          filename: portable.name,
        });
      } else {
        console.log("Using existent: " + tempZipFilename);
      }

      // unzipping
      console.log("Uncompressing");
      const zip = new AdmZip(tempZipFilename);
      zip.extractAllTo(tempPath, true);

      // Move all files from the temp unzipped directory to the destination directory
      console.log("Moving files to package manager path");
      const globalPath = getGlobalPath();
      const appGlobalPath = path.join(globalPath, app);

      const filenameWithoutExtension = path.basename(
        portable.name,
        path.extname(portable.name)
      );
      const unzippedPath = path.join(tempPath, filenameWithoutExtension);
      moveFiles(unzippedPath, appGlobalPath);

      // creating run files
      console.log("Creating runner files");
      const exe = "MouseJiggler.exe";
      const cmd = format(cmdTemplate, {
        subfolder: app,
        exe,
      }).trim();

      const cmdFilename = path.join(globalPath, `${app}.cmd`);
      saveFile(cmdFilename, cmd);

      const ps1 = format(ps1Template, {
        subfolder: app,
        exe,
      }).trim();

      const ps1Filename = path.join(globalPath, `${app}.ps1`);
      saveFile(ps1Filename, ps1);
    }
  }
}

const cmdTemplate = `
@echo off
cd /d "%~dp0{subfolder}"
start "" "{exe}"
`;

const ps1Template = `
$initialLocation = Get-Location

Set-Location -Path "$PSScriptRoot\\{subfolder}"

Start-Process -FilePath "{exe}" -Wait

Set-Location -Path $initialLocation
`;

start().catch((err) => console.error(err));
