// routes/user.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../../config/db_dearbasket");

// GET all users
router.get("/", async (req, res, next) => {
  try {
    await poolConnect;
    const result = await pool.request().query("SELECT * FROM tbl_user;");
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

// GET user by transid
router.get("/:id", async (req, res, next) => {
  try {
    await poolConnect;
    const result = await pool
      .request()
      .input("transid", sql.VarChar, req.params.id)
      .query("SELECT * FROM tbl_user WHERE transid = @transid;");
    if (!result.recordset.length) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
});

// CREATE user
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      dob,
      profile,
      address,
      mobile,
      latitude,
      longitude,
      usertype,
      status,
      rcu,
    } = req.body;

    // require all inputs
    if (
      [
        name,
        dob,
        profile,
        address,
        mobile,
        latitude,
        longitude,
        usertype,
        status,
        rcu,
      ].some((v) => v == null)
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await poolConnect;
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("dob", sql.NVarChar, dob)
      .input("profile", sql.NVarChar, profile)
      .input("address", sql.NVarChar, address)
      .input("mobile", sql.NVarChar, mobile)
      .input("latitude", sql.NVarChar, latitude)
      .input("longitude", sql.NVarChar, longitude)
      .input("usertype", sql.NVarChar, usertype)
      .input("status", sql.Int, status)
      .input("rcu", sql.NVarChar, rcu).query(`
        INSERT INTO tbl_user
          ([name], dob, profile, address, mobile,
           latitude, longitude, usertype, status, rcu)
        OUTPUT INSERTED.*
        VALUES
          (@name, @dob, @profile, @address, @mobile,
           @latitude, @longitude, @usertype, @status, @rcu);
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
});

// UPDATE user by transid in body
router.put("/", async (req, res, next) => {
  try {
    const id = req.body.transid;
    const fields = [
      "name",
      "dob",
      "profile",
      "address",
      "mobile",
      "latitude",
      "longitude",
      "usertype",
      "status",
      "luu",
    ];
    const updates = [];
    const request = pool.request();

    request.input("transid", sql.VarChar, id);
    fields.forEach((f) => {
      if (req.body[f] != null) {
        updates.push(`${f} = @${f}`);
        // status should be Int, everything else NVarchar
        const type = f === "status" ? sql.Int : sql.NVarChar;
        request.input(f, type, req.body[f]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    // match your ASP code’s timestamp column
    updates.push("lum = GETDATE()");

    await poolConnect;
    const result = await request.query(`
      UPDATE tbl_user
      SET ${updates.join(", ")}
      WHERE transid = @transid;
      SELECT @@ROWCOUNT AS affected;
    `);

    if (!result.recordset[0].affected) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Updated successfully" });
  } catch (err) {
    next(err);
  }
});

// DELETE user by transid in body
router.delete("/", async (req, res, next) => {
  try {
    const id = req.body.transid;
    if (!id) {
      return res.status(400).json({ message: "transid required" });
    }

    await poolConnect;
    const result = await pool.request().input("transid", sql.VarChar, id)
      .query(`
        DELETE FROM tbl_user
        WHERE transid = @transid;
        SELECT @@ROWCOUNT AS affected;
      `);

    if (!result.recordset[0].affected) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
