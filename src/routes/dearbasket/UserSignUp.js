// routes/API/DearBasket/UserSignUp.js
const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../../config/db_dearbasket');

// POST /API/DearBasket/UserSignUp
router.post('/', async (req, res, next) => {
  try {
    const {
      fullname,
      dob,
      profile,
      address,
      mobile,
      usertype,
      username,
      password,
      rcu
    } = req.body;

    // require all nine inputs
    if (
      !fullname ||
    //   !dob ||
    //   !profile ||
    //   !address ||
      !mobile ||
      !usertype ||
      !username ||
      !password ||
      !rcu
    ) {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    await poolConnect;
    const request = pool.request();

    // input parameters
    request.input('fullname',  sql.NVarChar, fullname);
    request.input('dob',       sql.Date,     dob);
    request.input('profile',   sql.NVarChar, profile);
    request.input('address',   sql.NVarChar, address);
    request.input('mobile',    sql.NVarChar, mobile);
    request.input('usertype',  sql.NVarChar, usertype);
    request.input('username',  sql.NVarChar, username);
    request.input('password',  sql.NVarChar, password);
    request.input('rcu',       sql.NVarChar, rcu);

    // output parameters
    request.output('sts', sql.Int);
    request.output('msg', sql.NVarChar(500));

    // execute the stored procedure
    const result = await request.execute('sp_insertuser');

    // grab result‐set and output values
    const responseTable = result.recordset;
    const sts = result.output.sts;
    const msg = result.output.msg;

    // send back the same envelope
    res.json({
      Status:        sts,
      Message:       msg,
      Response:      [],
      ResponseCode:  '200',
      RequestReceived: req.body
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
