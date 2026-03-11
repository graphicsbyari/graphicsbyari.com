const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const rootDir = path.resolve(__dirname, "..");
const uploadsDir = path.join(rootDir, "assets", "uploads");
const imageMapPath = path.join(rootDir, "assets", "data", "site-images.json");
const slotsPath = path.join(rootDir, "assets", "data", "image-slots.json");
const htmlFiles = [
  path.join(rootDir, "index.html"),
  path.join(rootDir, "about.html"),
  path.join(rootDir, "services.html"),
  path.join(rootDir, "contact.html")
];

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(rootDir));

function readImageMap() {
  if (!fs.existsSync(imageMapPath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(imageMapPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function writeImageMap(map) {
  fs.writeFileSync(imageMapPath, JSON.stringify(map, null, 2), "utf8");
}

function readSlotsFile() {
  if (!fs.existsSync(slotsPath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(slotsPath, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function extractSlotsFromHtml() {
  const slots = new Set();
  const pattern = /data-image-key=\"([^\"]+)\"/g;

  htmlFiles.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      return;
    }
    const html = fs.readFileSync(filePath, "utf8");
    let match;
    while ((match = pattern.exec(html)) !== null) {
      slots.add(match[1]);
    }
  });

  return slots;
}

function getAllSlots() {
  const map = readImageMap();
  const slots = extractSlotsFromHtml();
  readSlotsFile().forEach((slot) => {
    if (slot && slot.key) {
      slots.add(slot.key);
    }
  });
  Object.keys(map).forEach((key) => slots.add(key));
  return Array.from(slots).sort();
}

function sanitizeBaseName(filename) {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext).toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return { base: base || "upload", ext: ext || ".png" };
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const { base, ext } = sanitizeBaseName(file.originalname);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (_req, file, cb) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed."));
    }
    cb(null, true);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/image-map", (_req, res) => {
  const map = readImageMap();
  getAllSlots().forEach((slot) => {
    if (!Object.prototype.hasOwnProperty.call(map, slot)) {
      map[slot] = "";
    }
  });
  res.json(map);
});

app.get("/api/slots", (_req, res) => {
  const slotMeta = readSlotsFile();
  if (slotMeta.length) {
    const metaMap = new Map(slotMeta.map((slot) => [slot.key, slot.label || slot.key]));
    const merged = getAllSlots().map((key) => ({
      key,
      label: metaMap.get(key) || key
    }));
    return res.json({ slots: merged });
  }

  res.json({ slots: getAllSlots() });
});

app.get("/api/images", (_req, res) => {
  const files = fs
    .readdirSync(uploadsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const fullPath = path.join(uploadsDir, entry.name);
      const stat = fs.statSync(fullPath);
      return {
        name: entry.name,
        path: `assets/uploads/${entry.name}`,
        size: stat.size,
        updatedAt: stat.mtime.toISOString()
      };
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  res.json({ files });
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  const slot = (req.body.slot || "").trim();

  if (!slot) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(400).json({ error: "Missing image slot." });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Missing image file." });
  }

  const map = readImageMap();
  const webPath = `assets/uploads/${req.file.filename}`;
  map[slot] = webPath;
  writeImageMap(map);

  res.json({
    success: true,
    slot,
    path: webPath,
    map
  });
});

app.post("/api/set-image", (req, res) => {
  const slot = (req.body.slot || "").trim();
  const imagePath = (req.body.imagePath || "").trim();

  if (!slot || !imagePath) {
    return res.status(400).json({ error: "slot and imagePath are required." });
  }

  const map = readImageMap();
  map[slot] = imagePath;
  writeImageMap(map);

  res.json({ success: true, slot, path: imagePath, map });
});

app.use((error, _req, res, _next) => {
  if (error && error.message) {
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Graphics by Ari server running at http://localhost:${PORT}`);
  console.log("Open admin uploader at http://localhost:" + PORT + "/admin.html");
});
