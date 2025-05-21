// routes/API/DearBasket/DailyMilkRegistration.js
const express = require('express');
const router  = express.Router();
const { pool, poolConnect, sql } = require('../../config/db_dearbasket');

// GET all registrations
router.get('/', async (req, res, next) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM tbl_dailymilkregistration;');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

// GET registration by transid
router.get('/:id', async (req, res, next) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('transid', sql.VarChar, req.params.id)
      .query('SELECT * FROM tbl_dailymilkregistration WHERE transid = @transid;');
    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
});

// CREATE registration
router.post('/', async (req, res, next) => {
  try {
    const {
      userid,
      name,
      dob,
      address,
      mobile,
      latitude,
      longitude,
      familymembers,
      status,
      rcu
    } = req.body;

    // require all inputs
    if (
      !userid ||
      !name ||
      !dob ||
      !address ||
      !mobile ||
      !latitude ||
      !longitude ||
      familymembers == null ||
      status == null ||
      !rcu
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await poolConnect;
    const result = await pool.request()
      .input('userid',        sql.NVarChar, userid)
      .input('name',          sql.NVarChar, name)
      .input('dob',           sql.Date,     dob)
      .input('address',       sql.NVarChar, address)
      .input('mobile',        sql.NVarChar, mobile)
      .input('latitude',      sql.NVarChar, latitude)
      .input('longitude',     sql.NVarChar, longitude)
      .input('familymembers', sql.Int,      familymembers)
      .input('status',        sql.Int,      status)
      .input('rcu',           sql.NVarChar, rcu)
      .query(`
        INSERT INTO tbl_dailymilkregistration
          (userid, name, dob, address, mobile, latitude, longitude, familymembers, status, rcu)
        OUTPUT INSERTED.*
        VALUES
          (@userid, @name, @dob, @address, @mobile, @latitude, @longitude, @familymembers, @status, @rcu);
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
});

// UPDATE registration by transid in body
router.put('/', async (req, res, next) => {
  try {
    const id     = req.body.transid;
    const fields = [
      'userid',
      'name',
      'dob',
      'address',
      'mobile',
      'latitude',
      'longitude',
      'familymembers',
      'status',
      'luu'
    ];
    const updates = [];
    const request = pool.request();

    request.input('transid', sql.VarChar, id);

    fields.forEach(f => {
      if (req.body[f] != null) {
        updates.push(`${f} = @${f}`);
        let type;
        switch (f) {
          case 'dob':           type = sql.Date;     break;
          case 'familymembers': type = sql.Int;      break;
          case 'status':        type = sql.Int;      break;
          default:              type = sql.NVarChar; break;
        }
        request.input(f, type, req.body[f]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    // always update last-updated-timestamp
    updates.push('lum = GETDATE()');

    await poolConnect;
    const result = await request.query(`
      UPDATE tbl_dailymilkregistration
      SET ${updates.join(', ')}
      WHERE transid = @transid;
      SELECT @@ROWCOUNT AS affected;
    `);

    if (!result.recordset[0].affected) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE registration by transid in body
router.delete('/', async (req, res, next) => {
  try {
    const id = req.body.transid;
    if (!id) {
      return res.status(400).json({ message: 'transid required' });
    }

    await poolConnect;
    const result = await pool.request()
      .input('transid', sql.VarChar, id)
      .query(`
        DELETE FROM tbl_dailymilkregistration
        WHERE transid = @transid;
        SELECT @@ROWCOUNT AS affected;
      `);

    if (!result.recordset[0].affected) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
