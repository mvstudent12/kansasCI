const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "../../public/gallery-images";
const outputDir = "../../public/gallery-images/webp";

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.readdirSync(inputDir).forEach((file) => {
  const inputFile = path.join(inputDir, file);
  const outputFile = path.join(outputDir, file.replace(/\.\w+$/, ".webp"));

  sharp(inputFile)
    .resize(1024) // max width 1024px, auto height
    .webp({ quality: 80 })
    .toFile(outputFile)
    .then(() => console.log(`Optimized ${file}`))
    .catch((err) => console.error(err));
});
