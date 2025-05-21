const express = require("express");
const path = require("path");
const createFileUploader = require("../../controllers/fileUpload.controller");
const router = express.Router();

// point at your real "Uploads/DearBasket/Images" folder on disk:
const baseDir = path.join(process.cwd(), "Uploads", "DearBasket");
// and tell the handler to return "~"-style paths under the same:
const virtualBase = "~/Uploads/DearBasket";

const { upload, handler } = createFileUploader({ baseDir, virtualBase });

// POST /dearbasket/upload
// form-data:
//   • path:  optional subfolder under Images
//   • file:  the binary file
router.post("/", upload.single("file"), handler);

module.exports = router;
