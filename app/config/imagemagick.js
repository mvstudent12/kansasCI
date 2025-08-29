// const sharp = require("sharp");
// const fs = require("fs");
// const path = require("path");

// const inputDir = "../../public/gallery-images";
// const outputDir = "../../public/gallery-images/webp";

// if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// fs.readdirSync(inputDir).forEach((file) => {
//   const inputFile = path.join(inputDir, file);
//   const outputFile = path.join(outputDir, file.replace(/\.\w+$/, ".webp"));

//   sharp(inputFile)
//     .resize(1024) // max width 1024px, auto height
//     .webp({ quality: 80 })
//     .toFile(outputFile)
//     .then(() => console.log(`Optimized ${file}`))
//     .catch((err) => console.error(err));
// });

//

// const sharp = require("sharp");
// const fs = require("fs");
// const path = require("path");

// const inputDir = path.resolve(__dirname, "../../public/uploads");
// const validExt = [".jpg", ".jpeg", ".png"];

// function processDir(dir) {
//   fs.readdirSync(dir).forEach((file) => {
//     const fullPath = path.join(dir, file);
//     const stat = fs.statSync(fullPath);

//     if (stat.isDirectory()) {
//       processDir(fullPath); // recurse into subfolders
//     } else {
//       const ext = path.extname(fullPath).toLowerCase();
//       if (!validExt.includes(ext)) return;

//       const outputFile = fullPath.replace(ext, ".webp");

//       // skip if already converted
//       if (fs.existsSync(outputFile)) {
//         console.log(`⏭️ Skipping ${file}, already has .webp`);
//         return;
//       }

//       sharp(fullPath)
//         .resize({ width: 1024, withoutEnlargement: true })
//         .webp({ quality: 80 })
//         .toFile(outputFile)
//         .then(() => {
//           console.log(`✅ Converted ${file} → ${path.basename(outputFile)}`);
//         })
//         .catch((err) => console.error(`❌ Error with ${file}:`, err));
//     }
//   });
// }

// // start recursion
// processDir(inputDir);

const fs = require("fs");
const path = require("path");

const targetDirs = [
  path.resolve(__dirname, "../../public/img"),
  path.resolve(__dirname, "../../public/uploads"),
];

function cleanDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      cleanDir(fullPath); // recurse into subfolders
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (ext !== ".webp") {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Deleted ${fullPath}`);
      }
    }
  });
}

// process both target dirs
targetDirs.forEach(cleanDir);

console.log("✅ Cleanup complete — only .webp files remain.");
