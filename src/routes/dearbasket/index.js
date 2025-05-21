const express = require("express");
const router = express.Router();

// pull in each table-file
router.use("/MenuSectionCategory", require("./MenuSectionCategory"));
router.use("/Menu", require("./Menu"));
router.use("/Section", require("./Section"));
router.use("/Category", require("./Category"));
router.use("/Type", require("./Type"));
router.use("/Product", require("./Product"));
router.use("/UserSignUp", require("./UserSignUp"));
router.use("/Login", require("./Login"));
router.use("/FileUpload", require("./FileUpload"));

// …more tables as you add them…

module.exports = router;
