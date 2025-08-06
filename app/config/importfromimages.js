const fs = require("fs");
const path = require("path");

function main() {
  const imageFolder = path.join(__dirname, "../config/product-images");
  const outputPath = path.join(__dirname, "../config/products.json");

  const files = fs.readdirSync(imageFolder);

  const products = [];

  for (const file of files) {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).replace(/[_-]/g, " ");
    const fileName = file;
    const imagePath = `/uploads/${file}`;

    // Build product object matching schema
    const product = {
      title: baseName,
      brandLine: guessBrandLine(baseName), // new helper for brandLine guess
      category: guessCategory(baseName),
      subcategory: guessSubcategory(baseName), // optional helper
      colors: [], // empty array by default
      dimensions: "", // blank default
      productLine: guessProductLine(baseName), // renamed from lineType
      description: "", // default blank
      images: [
        {
          originalName: fileName,
          fileName: fileName,
          path: imagePath,
          size: 0, // size unknown here, could add fs.statSync if needed
          mimetype: guessMimeType(ext),
        },
      ],
    };

    products.push(product);
    console.log(`✔️ Prepared: ${baseName}`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`✅ Products saved to ${outputPath}`);
}

main();

// Helper to guess category based on name keywords
function guessCategory(name) {
  if (/desk/i.test(name)) return "Desks";
  if (/table/i.test(name)) return "Tables";
  if (/chair/i.test(name)) return "Chairs";
  if (/seat/i.test(name)) return "Chairs";
  return "Misc";
}

// Helper to guess productLine based on name keywords
function guessProductLine(name) {
  if (/signature/i.test(name)) return "signature";
  if (/director/i.test(name)) return "director";
  if (/executive/i.test(name)) return "executive";
  return "none";
}

// Optional: Guess brandLine (example: you can expand this)
function guessBrandLine(name) {
  if (/commercial concepts/i.test(name)) return "Commercial Concepts";
  if (/worksimpli/i.test(name)) return "Commercial Concepts";
  return "Commercial Concepts";
}

// Optional: Guess subcategory based on name keywords
function guessSubcategory(name) {
  if (/task/i.test(name)) return "Task Seating";
  if (/conference/i.test(name)) return "Conference Tables";
  return "";
}

// Guess mimetype from extension (basic)
function guessMimeType(ext) {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
