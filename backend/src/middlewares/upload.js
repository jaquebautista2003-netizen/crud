const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/productos",
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, nombreUnico + extension);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;