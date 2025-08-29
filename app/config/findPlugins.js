const fs = require("fs");
const path = require("path");

const pluginsDir = path.resolve(__dirname, "../../public/plugins");
const outputFile = path.resolve(__dirname, "plugins-files.json");

// recursive function to get all files, grouped by top-level folder
function getFilesByPlugin(dir, baseDir = pluginsDir, grouped = {}) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getFilesByPlugin(fullPath, baseDir, grouped); // recurse
    } else {
      // get top-level plugin folder
      const relativePath = path.relative(baseDir, fullPath); // e.g., "codemirror/lib/codemirror.js"
      const topFolder = relativePath.split(path.sep)[0];

      if (!grouped[topFolder]) grouped[topFolder] = [];
      grouped[topFolder].push(relativePath);
    }
  });
  return grouped;
}

const groupedFiles = getFilesByPlugin(pluginsDir);

// write JSON
fs.writeFileSync(outputFile, JSON.stringify(groupedFiles, null, 2));

console.log(`✅ Collected ${Object.keys(groupedFiles).length} plugin folders.`);
console.log(`Saved grouped file list to ${outputFile}`);
