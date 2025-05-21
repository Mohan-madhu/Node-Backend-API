// src/app.js
require("dotenv").config(); // make sure this is at the very top, once
const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/Uploads", express.static(path.join(process.cwd(), "Uploads")));
app.use("/API/dearbasket", require("./routes/dearbasket"));

// generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
