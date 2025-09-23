// const fs = require("fs");
// const path = require("path");

// function main() {
//   const imageFolder = path.join(__dirname, "../config/product-images");
//   const outputPath = path.join(__dirname, "../config/products.json");

//   const files = fs.readdirSync(imageFolder);

//   const products = [];

//   for (const file of files) {
//     const ext = path.extname(file);
//     const baseName = path.basename(file, ext).replace(/[_-]/g, " ");
//     const fileName = file;
//     const imagePath = `/uploads/${file}`;

//     // Build product object matching schema
//     const product = {
//       title: baseName,
//       brandLine: guessBrandLine(baseName), // new helper for brandLine guess
//       category: guessCategory(baseName),
//       subcategory: guessSubcategory(baseName), // optional helper
//       colors: [], // empty array by default
//       dimensions: "", // blank default
//       productLine: guessProductLine(baseName), // renamed from lineType
//       description: "", // default blank
//       images: [
//         {
//           originalName: fileName,
//           fileName: fileName,
//           path: imagePath,
//           size: 0, // size unknown here, could add fs.statSync if needed
//           mimetype: guessMimeType(ext),
//         },
//       ],
//     };

//     products.push(product);
//     console.log(`✔️ Prepared: ${baseName}`);
//   }

//   fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
//   console.log(`✅ Products saved to ${outputPath}`);
// }

// main();

// // Helper to guess category based on name keywords
// function guessCategory(name) {
//   if (/desk/i.test(name)) return "Desks";
//   if (/table/i.test(name)) return "Tables";
//   if (/chair/i.test(name)) return "Chairs";
//   if (/seat/i.test(name)) return "Chairs";
//   return "Misc";
// }

// // Helper to guess productLine based on name keywords
// function guessProductLine(name) {
//   if (/signature/i.test(name)) return "signature";
//   if (/director/i.test(name)) return "director";
//   if (/executive/i.test(name)) return "executive";
//   return "none";
// }

// // Optional: Guess brandLine (example: you can expand this)
// function guessBrandLine(name) {
//   if (/commercial concepts/i.test(name)) return "Commercial Concepts";
//   if (/worksimpli/i.test(name)) return "Commercial Concepts";
//   return "Commercial Concepts";
// }

// // Optional: Guess subcategory based on name keywords
// function guessSubcategory(name) {
//   if (/task/i.test(name)) return "Task Seating";
//   if (/conference/i.test(name)) return "Conference Tables";
//   return "";
// }

// // Guess mimetype from extension (basic)
// function guessMimeType(ext) {
//   switch (ext.toLowerCase()) {
//     case ".jpg":
//     case ".jpeg":
//       return "image/jpeg";
//     case ".png":
//       return "image/png";
//     case ".gif":
//       return "image/gif";
//     default:
//       return "application/octet-stream";
//   }
// }
//-------------------------------------------------------------
// const fs = require("fs");
// const path = require("path");

// const folderPath = path.join(__dirname, "../../public", "gallery-images");
// const outputFile = path.join(__dirname, "gallery-images.json");

// const categories = [
//   "Lounge",
//   "Open-Plan",
//   "Cafe",
//   "Conference",
//   "Training",
//   "Reception",
//   "Private-Office",
// ];

// function detectCategory(fileName) {
//   const lowerName = fileName.toLowerCase();
//   for (const cat of categories) {
//     if (lowerName.includes(cat.toLowerCase())) return cat;
//   }
//   return "Uncategorized";
// }

// (async () => {
//   try {
//     const files = fs
//       .readdirSync(folderPath)
//       .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

//     const imageData = files.map((file) => {
//       const category = detectCategory(file);
//       return {
//         filePath: `/product/gallery-images/${file}`,
//         category,
//       };
//     });

//     fs.writeFileSync(outputFile, JSON.stringify(imageData, null, 2));
//     console.log(`✅ Saved ${imageData.length} entries to gallery-images.json`);
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// })();
//===================================
const fs = require("fs");
const path = require("path");

const categories = [
  {
    name: "Desks",
    subcategories: [
      "Desk & Credenza Shells",
      "Sit & Stand Desks",
      "Support Components",
      "Desk Pedestals",
      "Presentation Stations",
      "Reception Desks",
      "Desk Configurations",
      "Returns & Bridges",
      "Steel Desks",
      "Desk Frames & Bases",
    ],
    keywords: ["desk", "credenza", "pedestal", "station", "bridge", "return"],
  },
  {
    name: "Seating",
    subcategories: [
      "Big & Tall Chairs",
      "Guest Chairs",
      "Lounge Chairs",
      "Management & Conference Seatings",
      "Nesting & Stacking Chairs",
      "Chair Accessories",
      "Task Chairs",
      "Stools",
      "Executive Chairs",
      "Law Enforcement-24/7",
      "Heavy-Duty",
      "Ergonomic",
    ],
    keywords: ["chair", "seat", "stool", "task", "lounge", "executive"],
  },
  {
    name: "Tables",
    subcategories: [
      "Folding Tables",
      "Conference Tables",
      "Flip-Top Tables",
      "Height Adjustable Tables",
      "Occasional Tables",
      "Table Bases & Components",
      "Worksurfaces & Table Tops",
      "Work Tables",
    ],
    keywords: ["table", "top", "coffee", "conference"],
  },
  {
    name: "Storage",
    subcategories: [
      "Bookcases",
      "Hutches",
      "Lateral Files",
      "Desk Pedestals",
      "Steel Cabinets",
      "Storage Cabinets",
    ],
    keywords: ["cabinet", "file", "bookcase", "hutch", "storage"],
  },
  {
    name: "Accessories",
    subcategories: [
      "Center Drawers",
      "Chair Mats",
      "Cushions",
      "Desk Accessories",
      "Drawer Pulls & Grommets",
      "Keyboard & Mouse Trays",
      "Lock Kits & Keys",
      "Misc. Accessories",
      "Modular Power",
      "Monitor Mounts",
      "Task Lighting",
    ],
    keywords: [
      "cushion",
      "mat",
      "tray",
      "grommet",
      "lock",
      "lighting",
      "accessory",
    ],
  },
];

const IMAGES_DIR = "./images";

// Normalize title to replace special characters
function normalizeTitle(title) {
  return title
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[″]/g, '"')
    .trim();
}

// Create browser-safe file name
function slugify(title) {
  return normalizeTitle(title)
    .toLowerCase()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/[^a-z0-9\-_\.]/g, ""); // remove anything that's not URL-safe
}

// Assign category
function getCategory(title) {
  const lower = title.toLowerCase();
  for (const cat of categories) {
    if (cat.keywords.some((kw) => lower.includes(kw))) return cat.name;
  }
  // Fallback heuristic
  if (lower.includes("desk") || lower.includes("pedestal")) return "Desks";
  if (
    lower.includes("chair") ||
    lower.includes("seat") ||
    lower.includes("stool")
  )
    return "Seating";
  if (
    lower.includes("table") ||
    lower.includes("top") ||
    lower.includes("coffee")
  )
    return "Tables";
  if (
    lower.includes("cabinet") ||
    lower.includes("file") ||
    lower.includes("bookcase") ||
    lower.includes("storage")
  )
    return "Storage";
  return "Accessories";
}

// Parse subcategory
function getSubcategory(title, categoryName) {
  const cat = categories.find((c) => c.name === categoryName);
  if (!cat) return null;
  const lower = title.toLowerCase();
  for (const sub of cat.subcategories) {
    if (lower.includes(sub.toLowerCase().split("&")[0].trim())) return sub;
  }
  return null;
}

// Parse colors
function parseColor(title) {
  const colors = [
    "Black",
    "White",
    "Gray",
    "Blue",
    "Brown",
    "Beige",
    "Red",
    "Silver",
    "Mahogany",
    "Chocolate",
  ];
  return colors.filter((c) => title.toLowerCase().includes(c.toLowerCase()));
}

// Parse sizes
function parseSize(title) {
  const sizeRegex = /(\d{1,3}["']?\s?x\s?\d{1,3}["']?)/gi;
  const match = title.match(sizeRegex);
  return match || [];
}

// Read images
const files = fs.readdirSync(IMAGES_DIR).filter((f) => f.endsWith(".webp"));

const products = files.map((file) => {
  const originalTitle = path.parse(file).name;
  const title = normalizeTitle(originalTitle);
  const category = getCategory(title);
  const subcategory = getSubcategory(title, category);
  const colors = parseColor(title);
  const sizes = parseSize(title);
  const safeFileName = slugify(title) + ".webp";

  return {
    title,
    brandLine: "OEI",
    category,
    subcategory,
    colors,
    sizes,
    dimensions: sizes.join(", ") || null,
    productLine: "signature",
    description: "",
    details: "",
    images: [
      {
        originalName: file,
        fileName: safeFileName,
        path: `/uploads/${file}`,
        size: fs.statSync(path.join(IMAGES_DIR, file)).size,
        mimetype: "image/webp",
      },
    ],
    visible: true,
  };
});

// Write JSON
fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
console.log(`Created products.json with ${products.length} products.`);
