const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const csvParser = require("csv-parser");
const dotenv = require("dotenv");
const stream = require("stream");
const request = require("request");
const cheerio = require("cheerio");
const { body, validationResult } = require("express-validator");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "data/uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const storage1 = multer.memoryStorage();
const upload1 = multer({ storage: storage1 });

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your_secret_key",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/data", express.static(path.join(__dirname, "data")));
app.use("/", express.static(path.join(__dirname, "")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/setting", (req, res) => {
  res.sendFile(__dirname + "/setting.html");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.post("/login", (req, res) => {
  const indexnum = req.body.indexnum;
  const password = req.body.password;

  if (indexnum && password) {
    connection.query(
      "SELECT * FROM t_login WHERE indexnum = ? AND password = ?",
      [indexnum, password],
      (error, results) => {
        if (results.length > 0) {
          const user = results[0];
          req.session.loggedin = true;
          req.session.indexnum = indexnum;

          if (user.type.toLowerCase() === "admin") {
            res.redirect("/admin");
          } else if (user.type.toLowerCase() === "block") {
            res.send(
              '<script>alert("Blocked User! Contact Administration"); window.location.href="/login";</script>'
            );
            res.end();
          } else {
            res.redirect("/dashboard");
          }
        } else {
          res.send(
            '<script>alert("Incorrect indexnum or password!"); window.location.href="/login";</script>'
          );
          res.end();
        }
      }
    );
  } else {
    res.send(
      '<script>alert("Please Enter indexnum or password!"); window.location.href="/";</script>'
    );
    res.end();
  }
});

app.post(
  "/change-password",
  [
    body("indexnum").notEmpty().isInt(),
    body("old_password").notEmpty(),
    body("new_password").notEmpty(),
    body("confirm_new_password").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.send(
          '<script>alert("Error!"); window.location.href="/setting";</script>'
        );
      }

      const { indexnum, old_password, new_password, confirm_new_password } =
        req.body;

      if (new_password !== confirm_new_password) {
        return res.send(
          '<script>alert("New password and confirm new password do not match"); window.location.href="/setting";</script>'
        );
      }
      const getPasswordQuery = `SELECT password FROM t_login WHERE indexnum = ?`;

      const result = await new Promise((resolve, reject) => {
        connection.query(getPasswordQuery, [indexnum], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      if (result && result.length > 0 && "password" in result[0]) {
        const storedPassword = result[0].password;

        if (old_password !== storedPassword) {
          return res.send(
            '<script>alert("Invalid Old Password!"); window.location.href="/setting";</script>'
          );
        }

        const updatePasswordQuery = `UPDATE t_login SET password = ? WHERE indexnum = ?`;

        await new Promise((resolve, reject) => {
          connection.query(
            updatePasswordQuery,
            [new_password, indexnum],
            (updateErr) => {
              if (updateErr) {
                reject(updateErr);
              } else {
                resolve();
              }
            }
          );
        });

        console.log("Password updated successfully");
        return res.send(
          '<script>alert("Successfully Updated!"); window.location.href="/login";</script>'
        );
      } else {
        console.error("Unexpected result structure:", result);
        return res.send(
          '<script>alert("Error!"); window.location.href="/setting";</script>'
        );
      }
    } catch (error) {
      console.error("Error:", error);
      return res.send(
        '<script>alert("Error!"); window.location.href="/setting";</script>'
      );
    }
  }
);

app.get("/dashboard", (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname, "dashboard.html"));
  } else {
    res.redirect("/");
  }
});

app.get("/admin", (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname, "admin.html"));
  } else {
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      res.redirect("/login");
    }
  });
});

app.post(
  "/upload_profilePI",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      console.log(req.file);
      console.log(req.body);

      const {
        hidden_indexnum,
        pro_fnameSal,
        pro_fname,
        pro_name,
        pro_nic,
        pro_dob,
        pro_gender,
      } = req.body;

      const sql =
        "INSERT INTO t_profilePI (indexnum, pro_fnameSal, pro_fname, pro_name, pro_nic, pro_dob, pro_gender) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE pro_fnameSal = VALUES(pro_fnameSal), pro_fname = VALUES(pro_fname), pro_name = VALUES(pro_name), pro_nic = VALUES(pro_nic), pro_dob = VALUES(pro_dob), pro_gender = VALUES(pro_gender)";

      const result = await new Promise((resolve, reject) => {
        connection.query(
          sql,
          [
            hidden_indexnum,
            pro_fnameSal,
            pro_fname,
            pro_name,
            pro_nic,
            pro_dob,
            pro_gender,
          ],
          (err, result) => {
            if (err) {
              console.error(
                "Error inserting/updating data into the database:",
                err
              );
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      res.send(
        `<script>alert("Successfully Saved!"); window.location.href="/profile.html";</script>`
      );
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .send(
          `<script>alert("Error while Saving!"); window.location.href="/profile.html";</script>`
        );
    }
  }
);

app.get("/retrieve_profilePI", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_profilePic", upload.single("pro_pic"), (req, res) => {
  console.log(req.file);
  console.log(req.body);

  const { hidden_indexnum0 } = req.body;
  const pro_picPath = req.file ? req.file.path : null;

  const sql =
    "INSERT INTO t_profilePI (indexnum, pro_pic) VALUES (?,?) ON DUPLICATE KEY UPDATE pro_pic = VALUES(pro_pic)";

  connection.query(sql, [hidden_indexnum0, pro_picPath], (err, result) => {
    if (err) {
      console.error("Error inserting/updating data into the database:", err);
      return res
        .status(500)
        .send(
          `<script>alert("Error while Saving!"); window.location.href="/profile.html";</script>`
        );
    }
    res.send(
      `<script>alert("Successfully Saved!"); window.location.href="/profile.html";</script>`
    );
  });
});

app.post("/upload_profileAI", (req, res) => {
  console.log(req.body);

  const { hidden_indexnum1, pro_ay, pro_dor } = req.body;

  const sql =
    "INSERT INTO t_profileAI (indexnum, pro_ay, pro_dor) VALUES (?,?,?) ON DUPLICATE KEY UPDATE pro_ay = VALUES(pro_ay), pro_dor = VALUES(pro_dor)";

  connection.query(sql, [hidden_indexnum1, pro_ay, pro_dor], (err, result) => {
    if (err) {
      console.error("Error inserting/updating data into the database:", err);
      return res
        .status(500)
        .send(
          `<script>alert("Error while Saving!"); window.location.href="/profile.html";</script>`
        );
    }
    res.send(
      `<script>alert("Successfully Saved!"); window.location.href="/profile.html";</script>`
    );
  });
});

app.get("/retrieve_profileAI", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_profileCon", (req, res) => {
  console.log(req.body);

  const { hidden_indexnum2, pro_add, pro_mn, pro_hn, pro_ea } = req.body;

  const sql =
    "INSERT INTO t_profileCon (indexnum, pro_add, pro_mn,pro_hn,pro_ea) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE pro_add = VALUES(pro_add), pro_mn = VALUES(pro_mn), pro_hn = VALUES(pro_hn), pro_ea = VALUES(pro_ea)";

  connection.query(
    sql,
    [hidden_indexnum2, pro_add, pro_mn, pro_hn, pro_ea],
    (err, result) => {
      if (err) {
        console.error("Error inserting/updating data into the database:", err);
        return res
          .status(500)
          .send(
            `<script>alert("Error while Saving!"); window.location.href="/profile.html";</script>`
          );
      }
      res.send(
        `<script>alert("Successfully Saved!"); window.location.href="/profile.html";</script>`
      );
    }
  );
});

app.get("/retrieve_profileCon", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_profileICE", (req, res) => {
  console.log(req.body);

  const { hidden_indexnum3, pro_icefn, pro_iceadd, pro_icemn, pro_icerel } =
    req.body;

  const sql =
    "INSERT INTO t_profileICE (indexnum, pro_icefn, pro_iceadd, pro_icemn, pro_icerel) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE pro_icefn = VALUES(pro_icefn), pro_iceadd = VALUES(pro_iceadd), pro_icemn = VALUES(pro_icemn), pro_icerel = VALUES(pro_icerel)";

  connection.query(
    sql,
    [hidden_indexnum3, pro_icefn, pro_iceadd, pro_icemn, pro_icerel],
    (err, result) => {
      if (err) {
        console.error("Error inserting/updating data into the database:", err);
        return res
          .status(500)
          .send(
            `<script>alert("Error while Saving!"); window.location.href="/profile.html";</script>`
          );
      }
      res.send(
        `<script>alert("Successfully Saved!"); window.location.href="/profile.html";</script>`
      );
    }
  );
});

app.get("/retrieve_profileICE", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileICE WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_rd_profile_dash", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_rd_profile_medi", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_rd_profile_medi1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_rd_profile_medi2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fMedical WHERE fmedi_tname LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_fMedical", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fmedi_tname, rowsOfData } = req.body;

    if (!indexnum || !fmedi_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fmedi_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        ExamDate DATE
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fmedi_tname} (CourseNo, CourseName, ExamDate) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_medical.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_medical.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_fMedical1", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      fmedi_ay,
      fmedi_sem,
      fmedi_pur,
      fmedi_tname,
      fmedi_fdate,
      fmedi_tdate,
      fmedi_ailm,
      fmedi_sdate,
    } = req.body;

    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_fMedical (indexnum, fmedi_ay, fmedi_sem, fmedi_pur, fmedi_tname, fmedi_fdate, fmedi_tdate, fmedi_ailm, fmedi_sdate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        fmedi_ay = VALUES(fmedi_ay),
        fmedi_sem = VALUES(fmedi_sem),
        fmedi_pur = VALUES(fmedi_pur),
        fmedi_tname = VALUES(fmedi_tname),
        fmedi_fdate = VALUES(fmedi_fdate),
        fmedi_tdate = VALUES(fmedi_tdate),
        fmedi_ailm = VALUES(fmedi_ailm),
        fmedi_sdate = VALUES(fmedi_sdate)
    `;

    const result = await connection.query(sql, [
      indexnum,
      fmedi_ay,
      fmedi_sem,
      fmedi_pur,
      fmedi_tname,
      fmedi_fdate,
      fmedi_tdate,
      fmedi_ailm,
      fmedi_sdate,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_medical.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_medical.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_fPathReg", upload.single("file"), async (req, res) => {
  try {
    console.log(req.file);
    console.log(req.body);

    const {
      hidden_indexnum,
      fpreg_dob,
      fpreg_age,
      fpreg_gen,
      fpreg_zcore,
      fpreg_dis,
      fpreg_con,
      fpreg_p1,
      fpreg_p2,
      fpreg_p3,
    } = req.body;

    const sql =
      "INSERT INTO t_fPathReg (indexnum, fpreg_dob, fpreg_age, fpreg_gen, fpreg_zcore, fpreg_dis, fpreg_con, fpreg_p1, fpreg_p2, fpreg_p3) VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE fpreg_dob = VALUES(fpreg_dob), fpreg_age = VALUES(fpreg_age), fpreg_gen = VALUES(fpreg_gen), fpreg_zcore = VALUES(fpreg_zcore), fpreg_dis = VALUES(fpreg_dis), fpreg_con = VALUES(fpreg_con), fpreg_p1 = VALUES(fpreg_p1), fpreg_p2 = VALUES(fpreg_p2), fpreg_p3 = VALUES(fpreg_p3)";

    const result = await new Promise((resolve, reject) => {
      connection.query(
        sql,
        [
          hidden_indexnum,
          fpreg_dob,
          fpreg_age,
          fpreg_gen,
          fpreg_zcore,
          fpreg_dis,
          fpreg_con,
          fpreg_p1,
          fpreg_p2,
          fpreg_p3,
        ],
        (err, result) => {
          if (err) {
            console.error(
              "Error inserting/updating data into the database:",
              err
            );
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    res.send(
      `<script>alert("Successfully Saved!"); window.location.href="/form_pathRegistration.html";</script>`
    );
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_pathRegistration.html";</script>`
      );
  }
});

app.get("/retrieve_fPathReg", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fPathReg WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fPathReg1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fPathReg2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_feregpr", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, feregpr_tname, rowsOfData } = req.body;

    if (!indexnum || !feregpr_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${feregpr_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${feregpr_tname} (CourseNo, CourseName) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_properApplication.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_properApplication.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_feregpr1", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      feregpr_lvl,
      feregpr_ename,
      feregpr_aye,
      feregpr_comb,
      feregpr_dgr,
      feregpr_dor,
      feregpr_ay,
      feregpr_tname,
    } = req.body;

    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_fExamRegProp (indexnum, feregpr_lvl, feregpr_ename, feregpr_aye, feregpr_comb, feregpr_dgr, feregpr_dor, feregpr_ay, feregpr_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      feregpr_lvl = VALUES(feregpr_lvl),
      feregpr_ename = VALUES(feregpr_ename),
      feregpr_aye = VALUES(feregpr_aye),
      feregpr_comb = VALUES(feregpr_comb),
      feregpr_dgr = VALUES(feregpr_dgr),
      feregpr_dor = VALUES(feregpr_dor),
      feregpr_ay = VALUES(feregpr_ay),
      feregpr_tname = VALUES(feregpr_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      feregpr_lvl,
      feregpr_ename,
      feregpr_aye,
      feregpr_comb,
      feregpr_dgr,
      feregpr_dor,
      feregpr_ay,
      feregpr_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_properApplication.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_properApplication.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_feregpr", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_feregpr1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_feregpr2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_feregpr3", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fExamRegProp WHERE feregpr_tname LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_freggen", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, freggen_tname, rowsOfData } = req.body;

    if (!indexnum || !freggen_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${freggen_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        CourseCredit VARCHAR(25)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${freggen_tname} (CourseNo, CourseName, CourseCredit) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(General).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(General).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_freggen1", upload.single("freggen_rec"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      freggen_ay,
      freggen_cn,
      freggen_choi,
      freggen_dpay,
      freggen_recno,
      freggen_tname,
    } = req.body;

    const freggen_recPath = req.file ? req.file.path : null;
    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_freggen (indexnum, freggen_ay,freggen_cn,freggen_choi,freggen_dpay,freggen_recno,freggen_rec,freggen_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      freggen_ay = VALUES(freggen_ay),
      freggen_cn = VALUES(freggen_cn),
      freggen_choi = VALUES(freggen_choi),
      freggen_dpay = VALUES(freggen_dpay),
      freggen_recno = VALUES(freggen_recno),
      freggen_rec = VALUES(freggen_rec),
      freggen_tname = VALUES(freggen_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      freggen_ay,
      freggen_cn,
      freggen_choi,
      freggen_dpay,
      freggen_recno,
      freggen_recPath,
      freggen_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(General).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(General).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_freggen", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_freggen1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_freggen2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_freggen3", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_freggen WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_fregjm", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fregjm_tname, rowsOfData } = req.body;

    if (!indexnum || !fregjm_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fregjm_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        CourseCredit VARCHAR(25)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fregjm_tname} (CourseNo, CourseName, CourseCredit) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(JM).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(JM).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_fregjm1", upload.single("fregjm_rec"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      fregjm_ay,
      fregjm_cn,
      fregjm_choi,
      fregjm_dpay,
      fregjm_recno,
      fregjm_tname,
    } = req.body;

    const fregjm_recPath = req.file ? req.file.path : null;
    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_fregjm (indexnum,fregjm_ay,fregjm_cn,fregjm_choi,fregjm_dpay,fregjm_recno,fregjm_rec,fregjm_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      fregjm_ay = VALUES(fregjm_ay),
      fregjm_cn = VALUES(fregjm_cn),
      fregjm_choi = VALUES(fregjm_choi),
      fregjm_dpay = VALUES(fregjm_dpay),
      fregjm_recno = VALUES(fregjm_recno),
      fregjm_rec = VALUES(fregjm_rec),
      fregjm_tname = VALUES(fregjm_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      fregjm_ay,
      fregjm_cn,
      fregjm_choi,
      fregjm_dpay,
      fregjm_recno,
      fregjm_recPath,
      fregjm_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(JM).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(JM).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_fregjm", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregjm1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregjm2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregjm3", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fregjm WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_fregsp", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fregsp_tname, rowsOfData } = req.body;

    if (!indexnum || !fregsp_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fregsp_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        CourseCredit VARCHAR(25)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fregsp_tname} (CourseNo, CourseName, CourseCredit) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(Sp).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(Sp).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_fregsp1", upload.single("fregsp_rec"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      fregsp_ay,
      fregsp_cn,
      fregsp_choi,
      fregsp_dpay,
      fregsp_recno,
      fregsp_tname,
    } = req.body;

    const fregsp_recPath = req.file ? req.file.path : null;
    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_fregsp (indexnum,fregsp_ay,fregsp_cn,fregsp_choi,fregsp_dpay,fregsp_recno,fregsp_rec,fregsp_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      fregsp_ay = VALUES(fregsp_ay),
      fregsp_cn = VALUES(fregsp_cn),
      fregsp_choi = VALUES(fregsp_choi),
      fregsp_dpay = VALUES(fregsp_dpay),
      fregsp_recno = VALUES(fregsp_recno),
      fregsp_rec = VALUES(fregsp_rec),
      fregsp_tname = VALUES(fregsp_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      fregsp_ay,
      fregsp_cn,
      fregsp_choi,
      fregsp_dpay,
      fregsp_recno,
      fregsp_recPath,
      fregsp_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(Sp).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(Sp).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_fregsp", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregsp1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregsp2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregsp3", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fregsp WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_frrrex", upload.single("frrrex_rfrec"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      frrrex_id,
      frrrex_ay,
      frrrex_dgr,
      frrrex_ayrn,
      frrrex_ny,
      frrrex_rf,
    } = req.body;

    const frrrex_rfrecPath = req.file ? req.file.path : null;
    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_frrrex (indexnum,frrrex_id,frrrex_ay,frrrex_dgr,frrrex_ayrn,frrrex_ny, frrrex_rf,frrrex_rfrec)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      frrrex_id = VALUES(frrrex_id),
      frrrex_ay = VALUES(frrrex_ay),
      frrrex_dgr = VALUES(frrrex_dgr),
      frrrex_ayrn = VALUES(frrrex_ayrn),
      frrrex_ny = VALUES(frrrex_ny),
      frrrex_rf = VALUES(frrrex_rf),
      frrrex_rfrec = VALUES(frrrex_rfrec)
    `;

    const result = await connection.query(sql, [
      indexnum,
      frrrex_id,
      frrrex_ay,
      frrrex_dgr,
      frrrex_ayrn,
      frrrex_ny,
      frrrex_rf,
      frrrex_rfrecPath,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registrationRepeatExam.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registrationRepeatExam.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_frrrex", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_frrrex1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_frrrex2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_feregrp", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, feregrp_tname, rowsOfData } = req.body;

    if (!indexnum || !feregrp_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${feregrp_tname}\` (
        CourseNo VARCHAR(255)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${feregrp_tname} (CourseNo) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_repeatApplication.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_repeatApplication.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_feregrp1", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      feregrp_lvl,
      feregrp_ename,
      feregrp_aye,
      feregrp_comb,
      feregrp_dgr,
      feregrp_dor,
      feregrp_ay,
      feregrp_tname,
    } = req.body;

    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_feregrp (indexnum, feregrp_lvl, feregrp_ename, feregrp_aye, feregrp_comb, feregrp_dgr, feregrp_dor, feregrp_ay, feregrp_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      feregrp_lvl = VALUES(feregrp_lvl),
      feregrp_ename = VALUES(feregrp_ename),
      feregrp_aye = VALUES(feregrp_aye),
      feregrp_comb = VALUES(feregrp_comb),
      feregrp_dgr = VALUES(feregrp_dgr),
      feregrp_dor = VALUES(feregrp_dor),
      feregrp_ay = VALUES(feregrp_ay),
      feregrp_tname = VALUES(feregrp_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      feregrp_lvl,
      feregrp_ename,
      feregrp_aye,
      feregrp_comb,
      feregrp_dgr,
      feregrp_dor,
      feregrp_ay,
      feregrp_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_repeatApplication.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_repeatApplication.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_feregrp", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_feregrp1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_feregrp2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_fveri", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fveri_tname, rowsOfData } = req.body;

    if (!indexnum || !fveri_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fveri_tname}\` (
        Exam VARCHAR(255),
        Subject VARCHAR(255),
        Mark VARCHAR(50),
        Grade VARCHAR(50)
       )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fveri_tname} (Exam ,Subject ,Mark ,Grade) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_repeatApplication.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_repeatApplication.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_fveri1", upload.single("fveri_rec"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const { indexnum, fveri_ay, fveri_sem, fveri_tname } = req.body;

    const fveri_recPath = req.file ? req.file.path : null;
    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_fveri (indexnum,fveri_ay,fveri_sem, fveri_rec,fveri_tname)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      fveri_ay = VALUES(fveri_ay),
      fveri_sem = VALUES(fveri_sem),
      fveri_rec = VALUES(fveri_rec),
      fveri_tname = VALUES(fveri_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      fveri_ay,
      fveri_sem,
      fveri_recPath,
      fveri_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_verification.html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_verification.html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_fveri", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_complainFile", upload.single("file1"), (req, res) => {
  const { indexnum, number, comment } = req.body;
  const file1Path = req.file ? req.file.path : null;

  const sql = `
      INSERT INTO t_complain (indexnum, number, comment, file1)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      indexnum = VALUES(indexnum),
      number = VALUES(number),
      comment = VALUES(comment),
      file1 = VALUES(file1)
  `;

  connection.query(
    sql,
    [indexnum, number, comment, file1Path],
    (err, result) => {
      if (err) {
        console.error("Error inserting/updating data into the database:", err);
        return res
          .status(500)
          .send(
            `<script>alert("Error while Saving!"); window.location.href="/emergency.html";</script>`
          );
      }
      res.send(
        `<script>alert("Successfully Saved!"); window.location.href="/form_emergency.html";</script>`
      );
    }
  );
});

app.post("/import_profilepi", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_profilepi (indexnum, pro_pic, pro_fnameSal, pro_fname, pro_name, pro_nic, pro_dob, pro_gender) " +
          "VALUES (?,?, ?, ?, ?, ?, ?, ?) " +
          "ON DUPLICATE KEY UPDATE " +
          "pro_pic = VALUES(pro_pic), " +
          "pro_fnameSal = VALUES(pro_fnameSal), " +
          "pro_fname = VALUES(pro_fname), " +
          "pro_name = VALUES(pro_name), " +
          "pro_nic = VALUES(pro_nic), " +
          "pro_dob = VALUES(pro_dob), " +
          "pro_gender = VALUES(pro_gender)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.pro_pic,
            row.pro_fnameSal,
            row.pro_fname,
            row.pro_name,
            row.pro_nic,
            row.pro_dob,
            row.pro_gender,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_profilepi/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_profilepi WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_profilepi", (req, res) => {
  connection.query("SELECT * FROM t_profilepi", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td><img src="${row.pro_pic}" alt="Profile Picture" style="max-width: 100px; max-height: 100px; cursor: pointer;" onclick="toggleImage(this)"></td>
        <td>${row.pro_fnameSal}</td>
        <td>${row.pro_fname}</td>
        <td>${row.pro_name}</td>
        <td>${row.pro_nic}</td>
        <td>${row.pro_dob}</td>
        <td>${row.pro_gender}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Profile Picture</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>NIC</th>
          <th>Date of Birth</th>
          <th>Gender</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

// JavaScript function to toggle larger image display
function toggleImage(img) {
  const largerImage = document.getElementById("largerImage");
  largerImage.src = img.src;
  document.getElementById("largerImageContainer").style.display = "block";
}

// JavaScript function to hide larger image
function hideLargerImage() {
  document.getElementById("largerImageContainer").style.display = "none";
}


app.post("/add_profilepi", (req, res) => {
  const {
    indexnum,
    pro_pic,
    pro_fnameSal,
    pro_fname,
    pro_name,
    pro_nic,
    pro_dob,
    pro_gender,
  } = req.body;

  const sql =
    "INSERT INTO t_profilePI (indexnum, pro_pic, pro_fnameSal, pro_fname, pro_name, pro_nic, pro_dob, pro_gender) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE pro_pic = VALUES(pro_pic), pro_fnameSal = VALUES(pro_fnameSal), pro_fname = VALUES(pro_fname), pro_name = VALUES(pro_name), pro_nic = VALUES(pro_nic), pro_dob = VALUES(pro_dob), pro_gender = VALUES(pro_gender)";
  connection.query(
    sql,
    [
      indexnum,
      pro_pic,
      pro_fnameSal,
      pro_fname,
      pro_name,
      pro_nic,
      pro_dob,
      pro_gender,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_profilepi/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_profilepi WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.pro_pic}</td>
        <td>${row.pro_fnameSal}</td>
        <td>${row.pro_fname}</td>
        <td>${row.pro_name}</td>
        <td>${row.pro_nic}</td>
        <td>${row.pro_dob}</td>
        <td>${row.pro_gender}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Profile Picture</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>NIC</th>
          <th>Date of Birth</th>
          <th>Gender</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_profilepi_csv", (req, res) => {
  const sql = "SELECT * FROM t_profilepi";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.pro_pic,
        row.pro_fnameSal,
        row.pro_fname,
        row.pro_name,
        row.pro_nic,
        row.pro_dob,
        row.pro_gender,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.post("/import_profileai", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const importSql =
          "INSERT INTO t_profileai (indexnum, pro_ay, pro_dor) " +
          "VALUES (?, ?, ?) " +
          "ON DUPLICATE KEY UPDATE " +
          "pro_ay = VALUES(pro_ay), " +
          "pro_dor = VALUES(pro_dor)";

        results.forEach((row) => {
          const values = [row.indexnum, row.pro_ay, row.pro_dor];

          connection.query(importSql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_profileai/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const deleteSql = "DELETE FROM t_profileai WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_profileai", (req, res) => {
  connection.query("SELECT * FROM t_profileai", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.pro_ay}</td>
        <td>${row.pro_dor}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Profile Academic Year</th>
          <th>Date of Registration</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_profileai", (req, res) => {
  const { indexnum, pro_ay, pro_dor } = req.body;

  const addSql =
    "INSERT INTO t_profileai (indexnum, pro_ay, pro_dor) " +
    "VALUES (?, ?, ?) " +
    "ON DUPLICATE KEY UPDATE " +
    "pro_ay = VALUES(pro_ay), " +
    "pro_dor = VALUES(pro_dor)";

  connection.query(addSql, [indexnum, pro_ay, pro_dor], (error) => {
    if (error) {
      console.error("Error inserting data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.send("Data inserted successfully");
  });
});

app.get("/search_profileai/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const searchSql = "SELECT * FROM t_profileai WHERE indexnum = ?";
  connection.query(searchSql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.pro_ay}</td>
        <td>${row.pro_dor}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Profile Academic Year</th>
          <th>Date of Registration</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_profileai", (req, res) => {
  const exportSql = "SELECT * FROM t_profileai";

  connection.query(exportSql, (error, results, fields) => {
    if (error) {
      console.error("Error exporting data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results
      .map((row) => [row.indexnum, row.pro_ay, row.pro_dor].join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=profileai_export.csv"
    );
    res.send(csvData);
  });
});

app.post("/import_profilecon", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_profilecon (indexnum, pro_add, pro_mn, pro_hn, pro_ea) " +
          "VALUES (?,?, ?, ?, ?) " +
          "ON DUPLICATE KEY UPDATE " +
          "pro_add = VALUES(pro_add), " +
          "pro_mn = VALUES(pro_mn), " +
          "pro_hn = VALUES(pro_hn), " +
          "pro_ea = VALUES(pro_ea)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.pro_add,
            row.pro_mn,
            row.pro_hn,
            row.pro_ea,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_profilecon/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_profilecon WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_profilecon", (req, res) => {
  connection.query("SELECT * FROM t_profilecon", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.pro_add}</td>
        <td>${row.pro_mn}</td>
        <td>${row.pro_hn}</td>
        <td>${row.pro_ea}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Address</th>
          <th>Mobile Number</th>
          <th>Home Number</th>
          <th>Email Address</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_profilecon", (req, res) => {
  const { indexnum, pro_add, pro_mn, pro_hn, pro_ea } = req.body;

  const sql =
    "INSERT INTO t_profilecon (indexnum, pro_add, pro_mn, pro_hn, pro_ea) " +
    "VALUES (?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "pro_add = VALUES(pro_add), " +
    "pro_mn = VALUES(pro_mn), " +
    "pro_hn = VALUES(pro_hn), " +
    "pro_ea = VALUES(pro_ea)";

  connection.query(
    sql,
    [indexnum, pro_add, pro_mn, pro_hn, pro_ea],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_profilecon/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_profilecon WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.pro_add}</td>
        <td>${row.pro_mn}</td>
        <td>${row.pro_hn}</td>
        <td>${row.pro_ea}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Address</th>
          <th>Mobile Number</th>
          <th>Home Number</th>
          <th>Email Address</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_profilecon", (req, res) => {
  const sql = "SELECT * FROM t_profilecon";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error exporting data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => [
      row.indexnum,
      row.pro_add,
      row.pro_mn,
      row.pro_hn,
      row.pro_ea,
    ]);

    const csvString = csvData.map((row) => row.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="profilecon_data.csv"'
    );

    res.status(200).send(csvString);
  });
});

app.post("/import_profileice", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_profileice (indexnum, pro_icefn, pro_iceadd, pro_icemn, pro_icerel) " +
          "VALUES (?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "pro_icefn = VALUES(pro_icefn), " +
          "pro_iceadd = VALUES(pro_iceadd), " +
          "pro_icemn = VALUES(pro_icemn), " +
          "pro_icerel = VALUES(pro_icerel)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.pro_icefn,
            row.pro_iceadd,
            row.pro_icemn,
            row.pro_icerel,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.post("/add_profileice", (req, res) => {
  const { indexnum, pro_icefn, pro_iceadd, pro_icemn, pro_icerel } = req.body;

  const sql =
    "INSERT INTO t_profileice (indexnum, pro_icefn, pro_iceadd, pro_icemn, pro_icerel) " +
    "VALUES (?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "pro_icefn = VALUES(pro_icefn), " +
    "pro_iceadd = VALUES(pro_iceadd), " +
    "pro_icemn = VALUES(pro_icemn), " +
    "pro_icerel = VALUES(pro_icerel)";

  connection.query(
    sql,
    [indexnum, pro_icefn, pro_iceadd, pro_icemn, pro_icerel],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.delete("/delete_profileice/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_profileice WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_profileice", (req, res) => {
  connection.query("SELECT * FROM t_profileice", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.pro_icefn}</td>
        <td>${row.pro_iceadd}</td>
        <td>${row.pro_icemn}</td>
        <td>${row.pro_icerel}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>ICE Full Name</th>
          <th>ICE Address</th>
          <th>ICE Mobile Number</th>
          <th>ICE Relationship</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/search_profileice/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_profileice WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.pro_icefn}</td>
        <td>${row.pro_iceadd}</td>
        <td>${row.pro_icemn}</td>
        <td>${row.pro_icerel}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>ICE Full Name</th>
          <th>ICE Address</th>
          <th>ICE Mobile Number</th>
          <th>ICE Relationship</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_profileice_csv", (req, res) => {
  const sql = "SELECT * FROM t_profileice";

  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => Object.values(row).join(","));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=profileice_data.csv"
    );

    res.status(200).send(csvData.join("\n"));
  });
});

app.get("/getall_complain", (req, res) => {
  connection.query("SELECT * FROM t_complain", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.indexnum}</td>
        <td>${row.number}</td>
        <td>${row.comment}</td>
        <td><img src="${row.file1}" alt="File" style="max-width: 100px; max-height: 100px; cursor: pointer;" onclick="toggleImage(this)"></td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>ID</th>
          <th>Index</th>
          <th>Contact Number</th>
          <th>Comment</th>
          <th>File</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.get("/search_complain/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_complain WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.indexnum}</td>
        <td>${row.number}</td>
        <td>${row.comment}</td>
        <td>${row.file1}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>ID</th>
          <th>Index</th>
          <th>Contact Number</th>
          <th>Comment</th>
          <th>File</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_complain_csv", (req, res) => {
  const sql = "SELECT * FROM t_complain";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [row.id, row.index, row.number, row.comment, row.file1].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.post("/import_feregrp", upload1.single("csvFile"), async (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_feregrp (indexnum, feregrp_lvl, feregrp_ename, feregrp_aye, feregrp_comb, feregrp_dgr, feregrp_dor, feregrp_ay, feregrp_tname) " +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) " +
          "ON DUPLICATE KEY UPDATE " +
          "feregrp_lvl = VALUES(feregrp_lvl), " +
          "feregrp_ename = VALUES(feregrp_ename), " +
          "feregrp_aye = VALUES(feregrp_aye), " +
          "feregrp_comb = VALUES(feregrp_comb), " +
          "feregrp_dgr = VALUES(feregrp_dgr), " +
          "feregrp_dor = VALUES(feregrp_dor), " +
          "feregrp_ay = VALUES(feregrp_ay), " +
          "feregrp_tname = VALUES(feregrp_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.feregrp_lvl,
            row.feregrp_ename,
            row.feregrp_aye,
            row.feregrp_comb,
            row.feregrp_dgr,
            row.feregrp_dor,
            row.feregrp_ay,
            row.feregrp_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_feregrp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_feregrp WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_feregrp", (req, res) => {
  connection.query("SELECT * FROM t_feregrp", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <td>${row.indexnum}</td>
      <td>${row.feregrp_lvl}</td>
      <td>${row.feregrp_ename}</td>
      <td>${row.feregrp_aye}</td>
      <td>${row.feregrp_comb}</td>
      <td>${row.feregrp_dgr}</td>
      <td>${row.feregrp_dor}</td>
      <td>${row.feregrp_ay}</td>
      <td>${row.feregrp_tname}</td>
    </tr>`
      )
      .join("");

    const tableHTML = `
    <table class="table table-bordered">
    <tr>
      <th>Index</th>
      <th>Level</th>
      <th>Exam Name</th>
      <th>Exam AY</th> 
      <th>Combination</th>
      <th>Dgree</th>
      <th>Registration Date</th>
      <th>AY</th>
      <th>Table Name</th>
      </tr>
      ${tableRows}
    </table>
  `;

    res.send(tableHTML);
  });
});

app.post("/add_feregrp", (req, res) => {
  const {
    indexnum,
    feregrp_lvl,
    feregrp_ename,
    feregrp_aye,
    feregrp_comb,
    feregrp_dgr,
    feregrp_dor,
    feregrp_ay,
    feregrp_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_feregrp (indexnum, feregrp_lvl, feregrp_ename, feregrp_aye, feregrp_comb, feregrp_dgr, feregrp_dor, feregrp_ay, feregrp_tname) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)" +
    "ON DUPLICATE KEY UPDATE " +
    "feregrp_lvl = VALUES(feregrp_lvl)," +
    "feregrp_ename = VALUES(feregrp_ename)," +
    "feregrp_aye = VALUES(feregrp_aye)," +
    "feregrp_comb = VALUES(feregrp_comb)," +
    "feregrp_dgr = VALUES(feregrp_dgr)," +
    "feregrp_dor = VALUES(feregrp_dor)," +
    "feregrp_ay = VALUES(feregrp_ay)," +
    "feregrp_tname = VALUES(feregrp_tname)";

  connection.query(
    sql,
    [
      indexnum,
      feregrp_lvl,
      feregrp_ename,
      feregrp_aye,
      feregrp_comb,
      feregrp_dgr,
      feregrp_dor,
      feregrp_ay,
      feregrp_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_feregrp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_feregrp WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <td>${row.indexnum}</td>
      <td>${row.feregrp_lvl}</td>
      <td>${row.feregrp_ename}</td>
      <td>${row.feregrp_aye}</td>
      <td>${row.feregrp_comb}</td>
      <td>${row.feregrp_dgr}</td>
      <td>${row.feregrp_dor}</td>
      <td>${row.feregrp_ay}</td>
      <td>${row.feregrp_tname}</td>
    </tr>`
      )
      .join("");

    const tableHTML = `
  <table class="table table-bordered">
  <tr>
  <th>Index</th>
  <th>Level</th>
  <th>Exam Name</th>
  <th>Exam AY</th>
  <th>Full Name (Salutation)</th>
  <th>Full Name</th>
  <th>Name</th>
  <th>Address</th>
  <th>Contact Number</th> 
  <th>Combination</th>
  <th>Dgree</th>
  <th>Registration Date</th>
  <th>AY</th>
  <th>Table Name</th>
  </tr>
      ${tableRows}
    </table>
  `;

    res.send(tableHTML);
  });
});

app.get("/export_feregrp_csv", (req, res) => {
  const sql = "SELECT * FROM t_feregrp";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.feregrp_lvl,
        row.feregrp_ename,
        row.feregrp_aye,
        row.feregrp_comb,
        row.feregrp_dgr,
        row.feregrp_dor,
        row.feregrp_ay,
        row.feregrp_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_feregrptable", (req, res) => {
  const tname = req.query.tname;

  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
        <table class="table table-bordered">
            <tr>
                <th>CourseNo</th>
                <th>CourseName</th>
            </tr>
            ${results
              .map(
                (row) => `
                <tr>
                    <td>${row.CourseNo}</td>
                    <td>${row.CourseName}</td>
                </tr>
            `
              )
              .join("")}
        </table>
    `;

    res.send(dataHTML);
  });
});

app.post(
  "/import_fexamregprop",
  upload1.single("csvFile"),
  async (req, res) => {
    try {
      const csvFile = req.file;
      if (!csvFile) {
        throw new Error("No file uploaded.");
      }

      const results = [];
      const csvStream = csvParser()
        .on("data", (data) => results.push(data))
        .on("end", () => {
          const sql =
            "INSERT INTO t_fExamRegProp (indexnum, feregpr_lvl, feregpr_ename, feregpr_aye, feregpr_comb, feregpr_dgr, feregpr_dor, feregpr_ay, feregpr_tname) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) " +
            "ON DUPLICATE KEY UPDATE " +
            "feregpr_lvl = VALUES(feregpr_lvl), " +
            "feregpr_ename = VALUES(feregpr_ename), " +
            "feregpr_aye = VALUES(feregpr_aye), " +
            "feregpr_comb = VALUES(feregpr_comb), " +
            "feregpr_dgr = VALUES(feregpr_dgr), " +
            "feregpr_dor = VALUES(feregpr_dor), " +
            "feregpr_ay = VALUES(feregpr_ay), " +
            "feregpr_tname = VALUES(feregpr_tname)";

          results.forEach((row) => {
            const values = [
              row.indexnum,
              row.feregpr_lvl,
              row.feregpr_ename,
              row.feregpr_aye,
              row.feregpr_comb,
              row.feregpr_dgr,
              row.feregpr_dor,
              row.feregpr_ay,
              row.feregpr_tname,
            ];

            connection.query(sql, values, (error) => {
              if (error) {
                console.error("Error inserting data:", error);
                res.status(500).send("Internal Server Error");
                return;
              }
            });
          });

          res.send("Data imported successfully");
        });

      const stream = require("stream");
      const readableStream = new stream.PassThrough();
      readableStream.end(csvFile.buffer);
      readableStream.pipe(csvStream);
    } catch (error) {
      console.error("Error importing data:", error.message);
      res.status(400).send(error.message);
    }
  }
);

app.delete("/delete_fexamregprop/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fexamregprop WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fexamregprop", (req, res) => {
  connection.query("SELECT * FROM t_fexamregprop", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <td>${row.indexnum}</td>
      <td>${row.feregpr_lvl}</td>
      <td>${row.feregpr_ename}</td>
      <td>${row.feregpr_aye}</td>
      <td>${row.feregpr_comb}</td>
      <td>${row.feregpr_dgr}</td>
      <td>${row.feregpr_dor}</td>
      <td>${row.feregpr_ay}</td>
      <td>${row.feregpr_tname}</td>
    </tr>`
      )
      .join("");

    const tableHTML = `
    <table class="table table-bordered">
    <tr>
      <th>Index</th>
      <th>Level</th>
      <th>Exam Name</th>
      <th>Exam AY</th>
      <th>Combination</th>
      <th>Dgree</th>
      <th>Registration Date</th>
      <th>AY</th>
      <th>Table Name</th>
      </tr>
      ${tableRows}
    </table>
  `;

    res.send(tableHTML);
  });
});

app.post("/add_fexamregprop", (req, res) => {
  const {
    indexnum,
    feregpr_lvl,
    feregpr_ename,
    feregpr_aye,
    feregpr_comb,
    feregpr_dgr,
    feregpr_dor,
    feregpr_ay,
    feregpr_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_fExamRegProp (indexnum, feregpr_lvl, feregpr_ename, feregpr_aye, feregpr_comb, feregpr_dgr, feregpr_dor, feregpr_ay, feregpr_tname) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)" +
    "ON DUPLICATE KEY UPDATE " +
    "feregpr_lvl = VALUES(feregpr_lvl)," +
    "feregpr_ename = VALUES(feregpr_ename)," +
    "feregpr_aye = VALUES(feregpr_aye)," +
    "feregpr_comb = VALUES(feregpr_comb)," +
    "feregpr_dgr = VALUES(feregpr_dgr)," +
    "feregpr_dor = VALUES(feregpr_dor)," +
    "feregpr_ay = VALUES(feregpr_ay)," +
    "feregpr_tname = VALUES(feregpr_tname)";

  connection.query(
    sql,
    [
      indexnum,
      feregpr_lvl,
      feregpr_ename,
      feregpr_aye,
      feregpr_comb,
      feregpr_dgr,
      feregpr_dor,
      feregpr_ay,
      feregpr_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_fexamregprop/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fexamregprop WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <td>${row.indexnum}</td>
      <td>${row.feregpr_lvl}</td>
      <td>${row.feregpr_ename}</td>
      <td>${row.feregpr_aye}</td>
      <td>${row.feregpr_comb}</td>
      <td>${row.feregpr_dgr}</td>
      <td>${row.feregpr_dor}</td>
      <td>${row.feregpr_ay}</td>
      <td>${row.feregpr_tname}</td>
    </tr>`
      )
      .join("");

    const tableHTML = `
  <table class="table table-bordered">
  <tr>
  <th>Index</th>
  <th>Level</th>
  <th>Exam Name</th>
  <th>Exam AY</th>
  <th>Full Name (Salutation)</th>
  <th>Full Name</th>
  <th>Name</th>
  <th>Address</th>
  <th>Contact Number</th> 
  <th>Combination</th>
  <th>Dgree</th>
  <th>Registration Date</th>
  <th>AY</th>
  <th>Table Name</th>
  </tr>
      ${tableRows}
    </table>
  `;

    res.send(tableHTML);
  });
});

app.get("/export_fexamregprop_csv", (req, res) => {
  const sql = "SELECT * FROM t_fexamregprop";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.feregpr_lvl,
        row.feregpr_ename,
        row.feregpr_aye,
        row.feregpr_comb,
        row.feregpr_dgr,
        row.feregpr_dor,
        row.feregpr_ay,
        row.feregpr_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fexamregproptable", (req, res) => {
  const tname = req.query.tname;

  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
        <table class="table table-bordered">
            <tr>
                <th>CourseNo</th>
                <th>CourseName</th>
            </tr>
            ${results
              .map(
                (row) => `
                <tr>
                    <td>${row.CourseNo}</td>
                    <td>${row.CourseName}</td>
                </tr>
            `
              )
              .join("")}
        </table>
    `;

    res.send(dataHTML);
  });
});

app.post("/import_fmedi", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fmedical " +
          "(indexnum, fmedi_ay, fmedi_sem, fmedi_pur, fmedi_tname, fmedi_fdate, fmedi_tdate, fmedi_ailm, fmedi_sdate) " +
          "VALUES (?,?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fmedi_ay = VALUES(fmedi_ay), " +
          "fmedi_sem = VALUES(fmedi_sem), " +
          "fmedi_pur = VALUES(fmedi_pur), " +
          "fmedi_tname = VALUES(fmedi_tname), " +
          "fmedi_fdate = VALUES(fmedi_fdate), " +
          "fmedi_tdate = VALUES(fmedi_tdate), " +
          "fmedi_ailm = VALUES(fmedi_ailm), " +
          "fmedi_sdate = VALUES(fmedi_sdate)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fmedi_ay,
            row.fmedi_sem,
            row.fmedi_pur,
            row.fmedi_tname,
            row.fmedi_fdate,
            row.fmedi_tdate,
            row.fmedi_ailm,
            row.fmedi_sdate,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fmedi/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fmedical WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fmedi", (req, res) => {
  connection.query("SELECT * FROM t_fmedical", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
        <tr>
          <td>${row.indexnum}</td>
          <td>${row.fmedi_ay}</td>
          <td>${row.fmedi_sem}</td>
          <td>${row.fmedi_pur}</td>
          <td>${row.fmedi_tname}</td>
          <td>${row.fmedi_fdate}</td>
          <td>${row.fmedi_tdate}</td>
          <td>${row.fmedi_ailm}</td>
          <td>${row.fmedi_sdate}</td>
        </tr>`
      )
      .join("");

    const tableHTML = `
        <table class="table table-bordered">
          <tr>
            <th>Index</th>
            <th>Academic Year</th>
            <th>Semester</th>
            <th>Purpose</th>
            <th>Table Name</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Ailment</th>
            <th>Start Date</th>
          </tr>
          ${tableRows}
        </table>
      `;

    res.send(tableHTML);
  });
});

app.post("/add_fmedi", (req, res) => {
  const {
    indexnum,
    fmedi_ay,
    fmedi_sem,
    fmedi_pur,
    fmedi_tname,
    fmedi_fdate,
    fmedi_tdate,
    fmedi_ailm,
    fmedi_sdate,
  } = req.body;

  const sql =
    "INSERT INTO t_fmedical (indexnum, fmedi_ay, fmedi_sem, fmedi_pur, fmedi_tname, fmedi_fdate, fmedi_tdate, fmedi_ailm, fmedi_sdate) " +
    "VALUES (?,?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fmedi_ay = VALUES(fmedi_ay), " +
    "fmedi_sem = VALUES(fmedi_sem), " +
    "fmedi_pur = VALUES(fmedi_pur), " +
    "fmedi_tname = VALUES(fmedi_tname), " +
    "fmedi_fdate = VALUES(fmedi_fdate), " +
    "fmedi_tdate = VALUES(fmedi_tdate), " +
    "fmedi_ailm = VALUES(fmedi_ailm), " +
    "fmedi_sdate = VALUES(fmedi_sdate)";

  connection.query(
    sql,
    [
      indexnum,
      fmedi_ay,
      fmedi_sem,
      fmedi_pur,
      fmedi_tname,
      fmedi_fdate,
      fmedi_tdate,
      fmedi_ailm,
      fmedi_sdate,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_fmedi/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const selectSQL = "SELECT * FROM t_fmedical WHERE indexnum = ?";
  connection.query(
    selectSQL,
    [indexnum],
    (selectError, selectResults, selectFields) => {
      if (selectError) {
        console.error("Error searching data:", selectError);
        res.status(500).send("Internal Server Error");
        return;
      }

      const tableRows = selectResults
        .map(
          (row) => `
        <tr>
        <td>${row.indexnum}</td>
        <td>${row.fmedi_ay}</td>
        <td>${row.fmedi_sem}</td>
        <td>${row.fmedi_pur}</td>
        <td>${row.fmedi_tname}</td>
        <td>${row.fmedi_fdate}</td>
        <td>${row.fmedi_tdate}</td>
        <td>${row.fmedi_ailm}</td>
        <td>${row.fmedi_sdate}</td>
        </tr>`
        )
        .join("");

      const tableHTML = `
        <table class="table table-bordered">
          <tr>
          <th>Index Number</th>
          <th>Full Name</th>
          <th>Address</th>
          <th>Academic Year</th>
          <th>Semester</th>
          <th>Purpose</th>
          <th>Table Name</th>
          <th>From Date</th>
          <th>To Date</th>
          <th>Ailment</th>
          <th>Start Date</th>
          </tr>
          ${tableRows}
        </table>
      `;

      res.send(tableHTML);
    }
  );
});

app.get("/export_fmedi_csv", (req, res) => {
  const selectDataSql = "SELECT * FROM t_fmedical";
  connection.query(selectDataSql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fmedi_ay,
        row.fmedi_sem,
        row.fmedi_pur,
        row.fmedi_tname,
        row.fmedi_fdate,
        row.fmedi_tdate,
        row.fmedi_ailm,
        row.fmedi_sdate,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fmeditable", (req, res) => {
  const tname = req.query.tname;

  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
      <table class="table table-bordered">
          <tr>
              <th>CourseNo</th>
              <th>CourseName</th>
              <th>ExamDate</th>
          </tr>
          ${results
            .map(
              (row) => `
              <tr>
                  <td>${row.CourseNo}</td>
                  <td>${row.CourseName}</td> 
                  <td>${row.ExamDate}</td>
              </tr>
          `
            )
            .join("")}
      </table>
    `;

    res.send(dataHTML);
  });
});

app.post("/import_fpathreg", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fpathreg (indexnum, fpreg_dob, fpreg_age, fpreg_gen, fpreg_zcore, fpreg_dis, fpreg_con, fpreg_p1, fpreg_p2, fpreg_p3) " +
          "VALUES (?,?,?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fpreg_dob = VALUES(fpreg_dob), " +
          "fpreg_age = VALUES(fpreg_age), " +
          "fpreg_gen = VALUES(fpreg_gen), " +
          "fpreg_zcore = VALUES(fpreg_zcore), " +
          "fpreg_dis = VALUES(fpreg_dis), " +
          "fpreg_con = VALUES(fpreg_con), " +
          "fpreg_p1 = VALUES(fpreg_p1), " +
          "fpreg_p2 = VALUES(fpreg_p2), " +
          "fpreg_p3 = VALUES(fpreg_p3)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fpreg_dob,
            row.fpreg_age,
            row.fpreg_gen,
            row.fpreg_zcore,
            row.fpreg_dis,
            row.fpreg_con,
            row.fpreg_p1,
            row.fpreg_p2,
            row.fpreg_p3,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fpathreg/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fpathreg WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fpathreg", (req, res) => {
  connection.query("SELECT * FROM t_fpathreg", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fpreg_dob}</td>
        <td>${row.fpreg_age}</td>
        <td>${row.fpreg_gen}</td>
        <td>${row.fpreg_zcore}</td>
        <td>${row.fpreg_dis}</td>
        <td>${row.fpreg_con}</td>
        <td>${row.fpreg_p1}</td>
        <td>${row.fpreg_p2}</td>
        <td>${row.fpreg_p3}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Date of Birth</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Z-Score</th>
          <th>District</th>
          <th>Contact</th>
          <th>Preference 1</th>
          <th>Preference 2</th>
          <th>Preference 3</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_fpathreg", (req, res) => {
  const {
    indexnum,
    fpreg_dob,
    fpreg_age,
    fpreg_gen,
    fpreg_zcore,
    fpreg_dis,
    fpreg_con,
    fpreg_p1,
    fpreg_p2,
    fpreg_p3,
  } = req.body;

  const sql =
    "INSERT INTO t_fpathreg (indexnum,  fpreg_dob, fpreg_age, fpreg_gen, fpreg_zcore, fpreg_dis, fpreg_con, fpreg_p1, fpreg_p2, fpreg_p3) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fpreg_dob = VALUES(fpreg_dob), " +
    "fpreg_age = VALUES(fpreg_age), " +
    "fpreg_gen = VALUES(fpreg_gen), " +
    "fpreg_zcore = VALUES(fpreg_zcore), " +
    "fpreg_dis = VALUES(fpreg_dis), " +
    "fpreg_con = VALUES(fpreg_con), " +
    "fpreg_p1 = VALUES(fpreg_p1), " +
    "fpreg_p2 = VALUES(fpreg_p2), " +
    "fpreg_p3 = VALUES(fpreg_p3)";

  connection.query(
    sql,
    [
      indexnum,
      fpreg_dob,
      fpreg_age,
      fpreg_gen,
      fpreg_zcore,
      fpreg_dis,
      fpreg_con,
      fpreg_p1,
      fpreg_p2,
      fpreg_p3,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_fpathreg/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fpathreg WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fpreg_dob}</td>
        <td>${row.fpreg_age}</td>
        <td>${row.fpreg_gen}</td>
        <td>${row.fpreg_zcore}</td>
        <td>${row.fpreg_dis}</td>
        <td>${row.fpreg_con}</td>
        <td>${row.fpreg_p1}</td>
        <td>${row.fpreg_p2}</td>
        <td>${row.fpreg_p3}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Address</th>
          <th>Date of Birth</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Z-Score</th>
          <th>District</th>
          <th>Contact</th>
          <th>Preference 1</th>
          <th>Preference 2</th>
          <th>Preference 3</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_fpreg_csv", (req, res) => {
  const sql = "SELECT * FROM t_fpathreg";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fpreg_dob,
        row.fpreg_age,
        row.fpreg_gen,
        row.fpreg_zcore,
        row.fpreg_dis,
        row.fpreg_con,
        row.fpreg_p1,
        row.fpreg_p2 || "",
        row.fpreg_p3 || "",
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_fpreg_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.post("/import_fregjm", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fregjm (indexnum,  fregjm_ay, fregjm_cn, fregjm_choi, fregjm_dpay, fregjm_recno, fregjm_rec, fregjm_tname) " +
          "VALUES (?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fregjm_ay = VALUES(fregjm_ay), " +
          "fregjm_cn = VALUES(fregjm_cn), " +
          "fregjm_choi = VALUES(fregjm_choi), " +
          "fregjm_dpay = VALUES(fregjm_dpay), " +
          "fregjm_recno = VALUES(fregjm_recno), " +
          "fregjm_rec = VALUES(fregjm_rec), " +
          "fregjm_tname = VALUES(fregjm_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fregjm_ay,
            row.fregjm_cn,
            row.fregjm_choi,
            row.fregjm_dpay,
            row.fregjm_recno,
            row.fregjm_rec,
            row.fregjm_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fregjm/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fregjm WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fregjm", (req, res) => {
  connection.query("SELECT * FROM t_fregjm", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fregjm_ay}</td>
        <td>${row.fregjm_cn}</td>
        <td>${row.fregjm_choi}</td>
        <td>${row.fregjm_dpay}</td>
        <td>${row.fregjm_recno}</td>
        <td><img src="${row.fregjm_rec}" alt="Record" style="max-width: 75px; max-height: 75px; cursor: pointer;" onclick="toggleImage(this)"></td>
        <td>${row.fregjm_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_fregjm", (req, res) => {
  const {
    indexnum,
    fregjm_ay,
    fregjm_cn,
    fregjm_choi,
    fregjm_dpay,
    fregjm_recno,
    fregjm_rec,
    fregjm_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_fregjm (indexnum,   fregjm_ay, fregjm_cn, fregjm_choi, fregjm_dpay, fregjm_recno, fregjm_rec, fregjm_tname) " +
    "VALUES (?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fregjm_ay = VALUES(fregjm_ay), " +
    "fregjm_cn = VALUES(fregjm_cn), " +
    "fregjm_choi = VALUES(fregjm_choi), " +
    "fregjm_dpay = VALUES(fregjm_dpay), " +
    "fregjm_recno = VALUES(fregjm_recno), " +
    "fregjm_rec = VALUES(fregjm_rec), " +
    "fregjm_tname = VALUES(fregjm_tname)";

  connection.query(
    sql,
    [
      indexnum,
      fregjm_ay,
      fregjm_cn,
      fregjm_choi,
      fregjm_dpay,
      fregjm_recno,
      fregjm_rec,
      fregjm_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.put("/update_fregjm/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const {
    fregjm_ay,
    fregjm_cn,
    fregjm_choi,
    fregjm_dpay,
    fregjm_recno,
    fregjm_rec,
    fregjm_tname,
  } = req.body;

  const sql =
    "UPDATE t_fregjm SET " +
    "fregjm_ay = ?, " +
    "fregjm_cn = ?, " +
    "fregjm_choi = ?, " +
    "fregjm_dpay = ?, " +
    "fregjm_recno = ?, " +
    "fregjm_rec = ?, " +
    "fregjm_tname = ? " +
    "WHERE indexnum = ?";

  connection.query(
    sql,
    [
      fregjm_ay,
      fregjm_cn,
      fregjm_choi,
      fregjm_dpay,
      fregjm_recno,
      fregjm_rec,
      fregjm_tname,
      indexnum,
    ],
    (error) => {
      if (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data updated successfully");
    }
  );
});

app.get("/search_fregjm/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fregjm WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fregjm_ay}</td>
        <td>${row.fregjm_cn}</td>
        <td>${row.fregjm_choi}</td>
        <td>${row.fregjm_dpay}</td>
        <td>${row.fregjm_recno}</td>
        <td>${row.fregjm_rec}</td>
        <td>${row.fregjm_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_fregjm_csv", (req, res) => {
  const sql = "SELECT * FROM t_fregjm";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fregjm_ay,
        row.fregjm_cn,
        row.fregjm_choi,
        row.fregjm_dpay,
        row.fregjm_recno,
        row.fregjm_rec,
        row.fregjm_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fregjmtable", (req, res) => {
  const tname = req.query.tname;
  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
        <table class="table table-bordered">
          <tr>
            <th>CourseNo</th>
            <th>CourseName</th>
            <th>CourseCredit</th>
          </tr>
          ${results
            .map(
              (row) => `
            <tr>
              <td>${row.CourseNo}</td>
              <td>${row.CourseName}</td>
              <td>${row.CourseCredit}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;

    res.send(dataHTML);
  });
});

app.post("/import_fregsp", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fregsp (indexnum,   fregsp_ay, fregsp_cn, fregsp_choi, fregsp_dpay, fregsp_recno, fregsp_rec, fregsp_tname) " +
          "VALUES (?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fregsp_ay = VALUES(fregsp_ay), " +
          "fregsp_cn = VALUES(fregsp_cn), " +
          "fregsp_choi = VALUES(fregsp_choi), " +
          "fregsp_dpay = VALUES(fregsp_dpay), " +
          "fregsp_recno = VALUES(fregsp_recno), " +
          "fregsp_rec = VALUES(fregsp_rec), " +
          "fregsp_tname = VALUES(fregsp_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fregsp_ay,
            row.fregsp_cn,
            row.fregsp_choi,
            row.fregsp_dpay,
            row.fregsp_recno,
            row.fregsp_rec,
            row.fregsp_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fregsp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fregsp WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fregsp", (req, res) => {
  connection.query("SELECT * FROM t_fregsp", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fregsp_ay}</td>
        <td>${row.fregsp_cn}</td>
        <td>${row.fregsp_choi}</td>
        <td>${row.fregsp_dpay}</td>
        <td>${row.fregsp_recno}</td>
        <td><img src="${row.fregsp_rec}" alt="Record" style="max-width: 100px; max-height: 100px; cursor: pointer;" onclick="toggleImage(this)"></td>
        <td>${row.fregsp_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_fregsp", (req, res) => {
  const {
    indexnum,
    fregsp_ay,
    fregsp_cn,
    fregsp_choi,
    fregsp_dpay,
    fregsp_recno,
    fregsp_rec,
    fregsp_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_fregsp (indexnum, fregsp_ay, fregsp_cn, fregsp_choi, fregsp_dpay, fregsp_recno, fregsp_rec, fregsp_tname) " +
    "VALUES (?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fregsp_ay = VALUES(fregsp_ay), " +
    "fregsp_cn = VALUES(fregsp_cn), " +
    "fregsp_choi = VALUES(fregsp_choi), " +
    "fregsp_dpay = VALUES(fregsp_dpay), " +
    "fregsp_recno = VALUES(fregsp_recno), " +
    "fregsp_rec = VALUES(fregsp_rec), " +
    "fregsp_tname = VALUES(fregsp_tname)";

  connection.query(
    sql,
    [
      indexnum,
      fregsp_ay,
      fregsp_cn,
      fregsp_choi,
      fregsp_dpay,
      fregsp_recno,
      fregsp_rec,
      fregsp_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.put("/update_fregsp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const {
    fregsp_ay,
    fregsp_cn,
    fregsp_choi,
    fregsp_dpay,
    fregsp_recno,
    fregsp_rec,
    fregsp_tname,
  } = req.body;

  const sql =
    "UPDATE t_fregsp SET " +
    "fregsp_ay = ?, " +
    "fregsp_cn = ?, " +
    "fregsp_choi = ?, " +
    "fregsp_dpay = ?, " +
    "fregsp_recno = ?, " +
    "fregsp_rec = ?, " +
    "fregsp_tname = ? " +
    "WHERE indexnum = ?";

  connection.query(
    sql,
    [
      fregsp_ay,
      fregsp_cn,
      fregsp_choi,
      fregsp_dpay,
      fregsp_recno,
      fregsp_rec,
      fregsp_tname,
      indexnum,
    ],
    (error) => {
      if (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data updated successfully");
    }
  );
});

app.get("/search_fregsp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fregsp WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fregsp_ay}</td>
        <td>${row.fregsp_cn}</td>
        <td>${row.fregsp_choi}</td>
        <td>${row.fregsp_dpay}</td>
        <td>${row.fregsp_recno}</td>
        <td>${row.fregsp_rec}</td>
        <td>${row.fregsp_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_fregsp_csv", (req, res) => {
  const sql = "SELECT * FROM t_fregsp";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fregsp_ay,
        row.fregsp_cn,
        row.fregsp_choi,
        row.fregsp_dpay,
        row.fregsp_recno,
        row.fregsp_rec,
        row.fregsp_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fregsptable", (req, res) => {
  const tname = req.query.tname;
  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
        <table class="table table-bordered">
          <tr>
            <th>CourseNo</th>
            <th>CourseName</th>
            <th>CourseCredit</th>
          </tr>
          ${results
            .map(
              (row) => `
            <tr>
              <td>${row.CourseNo}</td>
              <td>${row.CourseName}</td>
              <td>${row.CourseCredit}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;

    res.send(dataHTML);
  });
});

app.post("/import_frrrex", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_frrrex (indexnum, frrrex_id, frrrex_ay,  frrrex_dgr, frrrex_ayrn, frrrex_ny, frrrex_rf, frrrex_rfrec) " +
          "VALUES (?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "frrrex_id = VALUES(frrrex_id), " +
          "frrrex_ay = VALUES(frrrex_ay), " +
          "frrrex_dgr = VALUES(frrrex_dgr), " +
          "frrrex_ayrn = VALUES(frrrex_ayrn), " +
          "frrrex_ny = VALUES(frrrex_ny), " +
          "frrrex_rf = VALUES(frrrex_rf), " +
          "frrrex_rfrec = VALUES(frrrex_rfrec)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.frrrex_id,
            row.frrrex_ay,
            row.frrrex_dgr,
            row.frrrex_ayrn,
            row.frrrex_ny,
            row.frrrex_rf,
            row.frrrex_rfrec,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_frrrex/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_frrrex WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_frrrex", (req, res) => {
  connection.query("SELECT * FROM t_frrrex", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.frrrex_id}</td>
        <td>${row.frrrex_ay}</td>
        <td>${row.frrrex_dgr}</td>
        <td>${row.frrrex_ayrn}</td>
        <td>${row.frrrex_ny}</td>
        <td>${row.frrrex_rf}</td>
        <td><img src="${row.frrrex_rfrec}" alt="Record" style="max-width: 75px; max-height: 75px; cursor: pointer;" onclick="toggleImage(this)"></td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>FRRREX ID</th>
          <th>Academic Year</th>
          <th>Degree</th>
          <th>Academic Year Range</th>
          <th>Notes</th>
          <th>Reference</th>
          <th>Reference Record</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_frrrex", (req, res) => {
  const {
    indexnum,
    frrrex_id,
    frrrex_ay,
    frrrex_dgr,
    frrrex_ayrn,
    frrrex_ny,
    frrrex_rf,
    frrrex_rfrec,
  } = req.body;

  const sql =
    "INSERT INTO t_frrrex (indexnum, frrrex_id, frrrex_ay, frrrex_dgr, frrrex_ayrn, frrrex_ny, frrrex_rf, frrrex_rfrec) " +
    "VALUES (?,?,?,?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "frrrex_id = VALUES(frrrex_id), " +
    "frrrex_ay = VALUES(frrrex_ay), " +
    "frrrex_dgr = VALUES(frrrex_dgr), " +
    "frrrex_ayrn = VALUES(frrrex_ayrn), " +
    "frrrex_ny = VALUES(frrrex_ny), " +
    "frrrex_rf = VALUES(frrrex_rf), " +
    "frrrex_rfrec = VALUES(frrrex_rfrec)";

  connection.query(
    sql,
    [
      indexnum,
      frrrex_id,
      frrrex_ay,
      frrrex_dgr,
      frrrex_ayrn,
      frrrex_ny,
      frrrex_rf,
      frrrex_rfrec,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_frrrex/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_frrrex WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.frrrex_id}</td>
        <td>${row.frrrex_ay}</td>
        <td>${row.frrrex_dgr}</td>
        <td>${row.frrrex_ayrn}</td>
        <td>${row.frrrex_ny}</td>
        <td>${row.frrrex_rf}</td>
        <td>${row.frrrex_rfrec}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>FRRREX ID</th>
          <th>Academic Year</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Name</th>
          <th>Address</th>
          <th>Contact Number</th>
          <th>Degree</th>
          <th>Academic Year Range</th>
          <th>Notes</th>
          <th>Reference</th>
          <th>Reference Record</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_frrrex_csv", (req, res) => {
  const sql = "SELECT * FROM t_frrrex";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.frrrex_id,
        row.frrrex_ay,
        row.frrrex_dgr,
        row.frrrex_ayrn,
        row.frrrex_ny,
        row.frrrex_rf,
        row.frrrex_rfrec,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_frrrex_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.post("/import_login", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_login (indexnum, password, type) " +
          "VALUES (?,?, ?) " +
          "ON DUPLICATE KEY UPDATE " +
          "password = VALUES(password), " +
          "type = VALUES(type)";

        results.forEach((row) => {
          const values = [row.indexnum, row.password, row.type];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_login/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_login WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_login", (req, res) => {
  connection.query("SELECT * FROM t_login", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.password}</td>
        <td>${row.type}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Password</th>
          <th>Type</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_login", (req, res) => {
  const { indexnum, password, type } = req.body;

  const sql =
    "INSERT INTO t_login (indexnum, password, type) VALUES (?,?,?) " +
    "ON DUPLICATE KEY UPDATE password = VALUES(password), type = VALUES(type)";

  connection.query(sql, [indexnum, password, type], (error) => {
    if (error) {
      console.error("Error inserting data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.send("Data inserted successfully");
  });
});

app.get("/search_login/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_login WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.password}</td>
        <td>${row.type}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Password</th>
          <th>Type</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_login_csv", (req, res) => {
  const sql = "SELECT * FROM t_login";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [row.indexnum, row.password, row.type].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.post("/import_fveri", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fveri (indexnum, fveri_ay, fveri_sem, fveri_rec, fveri_tname) " +
          "VALUES (?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fveri_ay = VALUES(fveri_ay), " +
          "fveri_sem = VALUES(fveri_sem), " +
          "fveri_rec = VALUES(fveri_rec), " +
          "fveri_tname = VALUES(fveri_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fveri_ay,
            row.fveri_sem,
            row.fveri_rec,
            row.fveri_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fveri/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fveri WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fveri", (req, res) => {
  connection.query("SELECT * FROM t_fveri", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fveri_ay}</td>
        <td>${row.fveri_sem}</td>
        <td><img src="${row.fveri_rec}" alt="Record" style="max-width: 75px; max-height: 75px; cursor: pointer;" onclick="toggleImage(this)"></td>
        <td>${row.fveri_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Academic Year</th>
          <th>Semester</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_fveri", (req, res) => {
  const { indexnum, fveri_ay, fveri_sem, fveri_rec, fveri_tname } = req.body;

  const sql =
    "INSERT INTO t_fveri (indexnum, fveri_ay, fveri_sem, fveri_rec, fveri_tname) " +
    "VALUES (?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fveri_ay = VALUES(fveri_ay), " +
    "fveri_sem = VALUES(fveri_sem), " +
    "fveri_rec = VALUES(fveri_rec), " +
    "fveri_tname = VALUES(fveri_tname)";

  connection.query(
    sql,
    [indexnum, fveri_ay, fveri_sem, fveri_rec, fveri_tname],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.get("/search_fveri/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fveri WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fveri_ay}</td>
        <td>${row.fveri_sem}</td>
        <td>${row.fveri_rec}</td>
        <td>${row.fveri_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Academic Year</th>
          <th>Semester</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_fveri_csv", (req, res) => {
  const sql = "SELECT * FROM t_fveri";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fveri_ay,
        row.fveri_sem,
        row.fveri_rec,
        row.fveri_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fveritable", (req, res) => {
  const tname = req.query.tname;

  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
          <table class="table table-bordered">
              <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Mark</th>
                  <th>Grade</th>
              </tr>
              ${results
                .map(
                  (row) => `
                  <tr>
                      <td>${row.Exam}</td>
                      <td>${row.Subject}</td>
                      <td>${row.Mark}</td>
                      <td>${row.Grade}</td>
                  </tr>
              `
                )
                .join("")}
          </table>
      `;

    res.send(dataHTML);
  });
});

app.post("/import_freggen", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_freggen (indexnum, freggen_ay, freggen_cn, freggen_choi, freggen_dpay, freggen_recno, freggen_rec, freggen_tname) " +
          "VALUES (?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "freggen_ay = VALUES(freggen_ay), " +
          "freggen_cn = VALUES(freggen_cn), " +
          "freggen_choi = VALUES(freggen_choi), " +
          "freggen_dpay = VALUES(freggen_dpay), " +
          "freggen_recno = VALUES(freggen_recno), " +
          "freggen_rec = VALUES(freggen_rec), " +
          "freggen_tname = VALUES(freggen_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.freggen_ay,
            row.freggen_cn,
            row.freggen_choi,
            row.freggen_dpay,
            row.freggen_recno,
            row.freggen_rec,
            row.freggen_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_freggen/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_freggen WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_freggen", (req, res) => {
  connection.query("SELECT * FROM t_freggen", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.freggen_ay}</td>
        <td>${row.freggen_cn}</td>
        <td>${row.freggen_choi}</td>
        <td>${row.freggen_dpay}</td>
        <td>${row.freggen_recno}</td>
        <td><img src="${row.freggen_rec}" alt="Record" style="max-width: 75px; max-height: 75px; cursor: pointer;" onclick="toggleImage(this)"></td>
        <td>${row.freggen_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_freggen", (req, res) => {
  const {
    indexnum,
    freggen_ay,
    freggen_cn,
    freggen_choi,
    freggen_dpay,
    freggen_recno,
    freggen_rec,
    freggen_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_freggen (indexnum,  freggen_ay, freggen_cn, freggen_choi, freggen_dpay, freggen_recno, freggen_rec, freggen_tname) " +
    "VALUES (?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "freggen_ay = VALUES(freggen_ay), " +
    "freggen_cn = VALUES(freggen_cn), " +
    "freggen_choi = VALUES(freggen_choi), " +
    "freggen_dpay = VALUES(freggen_dpay), " +
    "freggen_recno = VALUES(freggen_recno), " +
    "freggen_rec = VALUES(freggen_rec), " +
    "freggen_tname = VALUES(freggen_tname)";

  connection.query(
    sql,
    [
      indexnum,
      freggen_ay,
      freggen_cn,
      freggen_choi,
      freggen_dpay,
      freggen_recno,
      freggen_rec,
      freggen_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.put("/update_freggen/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const {
    freggen_ay,
    freggen_cn,
    freggen_choi,
    freggen_dpay,
    freggen_recno,
    freggen_rec,
    freggen_tname,
  } = req.body;

  const sql =
    "UPDATE t_freggen SET " +
    "freggen_ay = ?, " +
    "freggen_cn = ?, " +
    "freggen_choi = ?, " +
    "freggen_dpay = ?, " +
    "freggen_recno = ?, " +
    "freggen_rec = ?, " +
    "freggen_tname = ? " +
    "WHERE indexnum = ?";

  connection.query(
    sql,
    [
      freggen_ay,
      freggen_cn,
      freggen_choi,
      freggen_dpay,
      freggen_recno,
      freggen_rec,
      freggen_tname,
      indexnum,
    ],
    (error) => {
      if (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data updated successfully");
    }
  );
});

app.get("/search_freggen/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_freggen WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.freggen_ay}</td>
        <td>${row.freggen_cn}</td>
        <td>${row.freggen_choi}</td>
        <td>${row.freggen_dpay}</td>
        <td>${row.freggen_recno}</td>
        <td>${row.freggen_rec}</td>
        <td>${row.freggen_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_freggen_csv", (req, res) => {
  const sql = "SELECT * FROM t_freggen";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.freggen_ay,
        row.freggen_cn,
        row.freggen_choi,
        row.freggen_dpay,
        row.freggen_recno,
        row.freggen_rec,
        row.freggen_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_freggentable", (req, res) => {
  const tname = req.query.tname;
  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
        <table class="table table-bordered">
          <tr>
            <th>CourseNo</th>
            <th>CourseName</th>
            <th>CourseCredit</th>
          </tr>
          ${results
            .map(
              (row) => `
            <tr>
              <td>${row.CourseNo}</td>
              <td>${row.CourseName}</td>
              <td>${row.CourseCredit}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;

    res.send(dataHTML);
  });
});

app.post("/insertEmergencyContact", upload.single("image"), (req, res) => {
  const { name, position, telephone, email } = req.body;
  const image = req.file.filename;

  const query =
    "INSERT INTO t_emergency (name, position, telephone, email, pic) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), position=VALUES(position), telephone=VALUES(telephone), email=VALUES(email), pic=VALUES(pic);";
  const values = [name, position, telephone, email, image];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting data into MySQL: " + err.stack);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ success: true, insertedId: results.insertId });
  });
});

app.get("/emergencyContacts", (req, res) => {
  const query = "SELECT * FROM t_emergency";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing MySQL query: " + err.stack);
      return res.status(500).send("Internal Server Error");
    }

    res.json(results);
  });
});

app.get("/insert", (req, res) => {
  res.sendFile(path.join(__dirname, "insert.html"));
});

app.post("/insertEmergencyContact", upload.single("image"), (req, res) => {
  const { name, position, telephone, email } = req.body;
  const image = req.file.filename;

  const query =
    "INSERT INTO t_emergency (name, position, telephone, email, pic) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), position=VALUES(position), telephone=VALUES(telephone), email=VALUES(email), pic=VALUES(pic);";
  const values = [name, position, telephone, email, image];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting data into MySQL: " + err.stack);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ success: true, insertedId: results.insertId });
  });
});

app.delete("/deleteEmergencyContact/:email", (req, res) => {
  const emailToDelete = req.params.email;

  const deleteQuery = `
      DELETE FROM t_emergency
      WHERE email = ?
    `;

  connection.query(deleteQuery, [emailToDelete], (err, result) => {
    if (err) {
      console.error("Error deleting emergency contact:", err);
      res.json({
        success: false,
        message: "Error deleting emergency contact. Please try again.",
      });
    } else if (result.affectedRows === 0) {
      res.json({ success: false, message: "Contact not found" });
    } else {
      console.log("Deleted successfully:", result);
      res.json({ success: true, message: "Contact deleted successfully" });
    }
  });
});

app.get("/searchEmergencyContact/:email", (req, res) => {
  const emailToSearch = req.params.email;

  const searchQuery = `
      SELECT * FROM t_emergency
      WHERE email = ?
    `;

  connection.query(searchQuery, [emailToSearch], (err, result) => {
    if (err) {
      console.error("Error searching for emergency contact:", err);
      res.json({
        success: false,
        message: "Error searching for emergency contact. Please try again.",
      });
    } else if (result.length === 0) {
      res.json({ success: false, message: "Contact not found" });
    } else {
      console.log("Search successful:", result);
      res.json({ success: true, data: result[0] });
    }
  });
});

app.get("/retrieve_dash1", (req, res) => {
  const facultyColumn = req.query.faccol;
  const retrieveQuery = `SELECT AY, ${facultyColumn} FROM t_dash WHERE id = 1`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/insert_tdash", (req, res) => {
  const {
    AY,
    Semester,
    fac0,
    fac1,
    fac2,
    fac3,
    fac4,
    fac5,
    fac6,
    fac7,
    fac8,
    fac9,
  } = req.body;

  const sql = `
  INSERT INTO t_dash (id, AY, Semester, fac0, fac1, fac2, fac3, fac4, fac5, fac6, fac7, fac8, fac9) VALUES ('1',?,?,?,?,?,?,?,?,?,?,?,? ) ON DUPLICATE KEY UPDATE
    AY = VALUES(AY),Semester = VALUES(Semester),fac0 = VALUES(fac0),fac1 = VALUES(fac1),fac2 = VALUES(fac2),fac3 = VALUES(fac3),fac4 = VALUES(fac4),fac5 = VALUES(fac5),fac6 = VALUES(fac6),fac7 = VALUES(fac7),fac8 = VALUES(fac8),fac9 = VALUES(fac9);`;

  connection.query(
    sql,
    [AY, Semester, fac0, fac1, fac2, fac3, fac4, fac5, fac6, fac7, fac8, fac9],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.send("Data updated successfully");
    }
  );
});

app.get("/search_tdash", (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM t_dash WHERE id = 1";
  connection.query(sql, [id], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.send(results);
  });
});

app.post("/import_result", upload1.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded.");
    }

    const csvFile = req.file;
    const fileName = req.file.originalname.replace(".csv", "");
    const columns = [];

    const csvStream = csvParser();

    const bufferString = req.file.buffer.toString();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(bufferString);

    bufferStream
      .pipe(csvStream)
      .on("headers", (headers) => {
        columns.push(...headers.map((column) => column.trim()));
      })
      .on("data", async (row) => {
        const rowData = {};
        columns.forEach((column) => {
          rowData[column] = row[column] || null;
        });

        const connection = await getConnectionFromPool();

        try {
          await createTable_result(connection, fileName, columns);
          await insertData_result(connection, fileName, rowData);
        } catch (err) {
          console.error("Error:", err);
        } finally {
          connection.release();
        }
      })
      .on("end", () => {
        res.send(
          '<script>alert("Successfully Saved!"); window.location.href="/a_result";</script>'
        );
      });
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).json({ error: error.message });
  }
});

function getConnectionFromPool() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

async function createTable_result(connection, tableName, columns) {
  return new Promise((resolve, reject) => {
    connection.query(
      `CREATE TABLE IF NOT EXISTS ?? (${columns
        .map((column) => `?? VARCHAR(255)`)
        .join(", ")})`,
      [tableName, ...columns],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

async function insertData_result(connection, tableName, rowData) {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO ?? SET ?`, [tableName, rowData], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

app.get("/getTables_result", async (req, res) => {
  try {
    const exportTables = await getTables_result();
    res.json(exportTables);
  } catch (error) {
    console.error("Error:", error);
  }
});

async function getTables_result() {
  return new Promise((resolve, reject) => {
    pool.getConnection((connectError, connection) => {
      if (connectError) {
        reject(connectError);
        return;
      }

      const tableNamePrefix = "_result";

      const query = `SHOW TABLES LIKE '${tableNamePrefix}%'`;

      connection.query(query, (queryError, results, fields) => {
        connection.release();
        if (queryError) {
          reject(queryError);
        } else {
          const tableNames = results.map(
            (result) => result[Object.keys(result)[0]]
          );
          resolve(tableNames);
        }
      });
    });
  });
}

async function getTables_result1() {
  try {
    const exportTables = await getTables_result();
    console.log("Tables:", exportTables);
  } catch (error) {
    console.error("Error:", error);
  }
}

app.get("/rungetTables_result1", async (req, res) => {
  try {
    await getTables_result1();
    res.json({ message: "getTables_result1 function executed successfully." });
  } catch (error) {
    console.error("Error running getTables_result1 function:", error);
  }
});

app.get("/a_result", (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname, "a_result.html"));
  } else {
    res.redirect("/");
  }
});

app.post("/deleteTable", async (req, res) => {
  try {
    const { tableName } = req.body;

    if (!tableName) {
      throw new Error("Table name is required.");
    }

    const connection = await getConnectionFromPool();

    try {
      await deleteTableFromDatabase(connection, tableName);
      res.send(
        '<script>alert("Successfully Deleted!"); window.location.href="/a_result";</script>'
      );
    } catch (err) {
      console.error("Error deleting table:", err);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting table:", error.message);
  }
});

async function deleteTableFromDatabase(connection, tableName) {
  return new Promise((resolve, reject) => {
    connection.query("DROP TABLE IF EXISTS ??", [tableName], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

app.get("/retrieve_result", (req, res) => {
  const searchInput = req.query.indexnum || "";
  const searchTable = req.query.tname || "";
  const retrieveQuery = `SELECT * FROM ${searchTable} WHERE indexnum LIKE '%${searchInput}%'`;

  pool.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully:");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_result_tfproper", (req, res) => {
  const indexnum = req.query.indexnum || "";
  const searchTable = req.query.tname || "";

  const retrieveQuery = `SELECT * FROM ${searchTable} WHERE indexnum LIKE '%${indexnum}%'`;

  pool.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully:");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_rd_combination_dash", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_combination WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});
app.get("/retrieve_rd_sem_dash", (req, res) => {
  const retrieveQuery = `SELECT * FROM t_dash WHERE id = '1'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/import_combination", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_combination (indexnum, combination) " +
          "VALUES (?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "combination = VALUES(combination)";

        results.forEach((row) => {
          const values = [row.indexnum, row.combination];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_combination/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_combination WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_combination", (req, res) => {
  connection.query("SELECT * FROM t_combination", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.combination}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered mt-4">
        <tr>
          <th>Index</th>
          <th>Combination</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_combination", (req, res) => {
  const { indexnum, combination } = req.body;

  const sql =
    "INSERT INTO t_combination (indexnum, combination) VALUES (?,?) " +
    "ON DUPLICATE KEY UPDATE combination = VALUES(combination)";

  connection.query(sql, [indexnum, combination], (error) => {
    if (error) {
      console.error("Error inserting data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.send("Data inserted successfully");
  });
});

app.get("/search_combination/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_combination WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.combination}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table border="1">
        <tr>
          <th>Index</th>
          <th>Combination</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_combination_csv", (req, res) => {
  const sql = "SELECT * FROM t_combination";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [row.indexnum, row.combination].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.post("/upload_fregl4sp", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fregl4sp_tname, rowsOfData } = req.body;

    if (!indexnum || !fregl4sp_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fregl4sp_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        CourseCredit VARCHAR(25)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fregl4sp_tname} (CourseNo, CourseName, CourseCredit) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(L4sp).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(L4sp).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post(
  "/upload_fregl4sp1",
  upload.single("fregl4sp_rec"),
  async (req, res) => {
    let connection;

    try {
      console.log(req.file);
      console.log(req.body);

      const {
        indexnum,
        fregl4sp_ay,
        fregl4sp_cn,
        fregl4sp_choi,
        fregl4sp_dpay,
        fregl4sp_recno,
        fregl4sp_tname,
      } = req.body;

      const fregl4sp_recPath = req.file ? req.file.path : null;
      connection = await mysql.createConnection(connectionConfig);

      const sql = `
      INSERT INTO t_fregl4sp (indexnum,fregl4sp_ay,fregl4sp_cn,fregl4sp_choi,fregl4sp_dpay,fregl4sp_recno,fregl4sp_rec,fregl4sp_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      fregl4sp_ay = VALUES(fregl4sp_ay),
      fregl4sp_cn = VALUES(fregl4sp_cn),
      fregl4sp_choi = VALUES(fregl4sp_choi),
      fregl4sp_dpay = VALUES(fregl4sp_dpay),
      fregl4sp_recno = VALUES(fregl4sp_recno),
      fregl4sp_rec = VALUES(fregl4sp_rec),
      fregl4sp_tname = VALUES(fregl4sp_tname)
    `;

      const result = await connection.query(sql, [
        indexnum,
        fregl4sp_ay,
        fregl4sp_cn,
        fregl4sp_choi,
        fregl4sp_dpay,
        fregl4sp_recno,
        fregl4sp_recPath,
        fregl4sp_tname,
      ]);

      res.send(
        `<script>alert("Successfully Saved!");window.location.href="/form_registration(L4sp).html";</script>`
      );
    } catch (error) {
      console.error(new Date(), "Error:", error);

      res
        .status(500)
        .send(
          `<script>alert("Error while Saving!"); window.location.href="/form_registration(L4sp).html";</script>`
        );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
);

app.get("/retrieve_fregl4sp", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl4sp1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl4sp2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl4sp3", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fregl4sp WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_fregl4jm", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fregl4jm_tname, rowsOfData } = req.body;

    if (!indexnum || !fregl4jm_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fregl4jm_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        CourseCredit VARCHAR(25)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fregl4jm_tname} (CourseNo, CourseName, CourseCredit) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(L4JM).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(L4JM).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post(
  "/upload_fregl4jm1",
  upload.single("fregl4jm_rec"),
  async (req, res) => {
    let connection;

    try {
      console.log(req.file);
      console.log(req.body);

      const {
        indexnum,
        fregl4jm_ay,
        fregl4jm_cn,
        fregl4jm_choi,
        fregl4jm_dpay,
        fregl4jm_recno,
        fregl4jm_tname,
      } = req.body;

      const fregl4jm_recPath = req.file ? req.file.path : null;
      connection = await mysql.createConnection(connectionConfig);

      const sql = `
      INSERT INTO t_fregl4jm (indexnum,fregl4jm_ay,fregl4jm_cn,fregl4jm_choi,fregl4jm_dpay,fregl4jm_recno,fregl4jm_rec,fregl4jm_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      fregl4jm_ay = VALUES(fregl4jm_ay),
      fregl4jm_cn = VALUES(fregl4jm_cn),
      fregl4jm_choi = VALUES(fregl4jm_choi),
      fregl4jm_dpay = VALUES(fregl4jm_dpay),
      fregl4jm_recno = VALUES(fregl4jm_recno),
      fregl4jm_rec = VALUES(fregl4jm_rec),
      fregl4jm_tname = VALUES(fregl4jm_tname)
    `;

      const result = await connection.query(sql, [
        indexnum,
        fregl4jm_ay,
        fregl4jm_cn,
        fregl4jm_choi,
        fregl4jm_dpay,
        fregl4jm_recno,
        fregl4jm_recPath,
        fregl4jm_tname,
      ]);

      res.send(
        `<script>alert("Successfully Saved!");window.location.href="/form_registration(L4JM).html";</script>`
      );
    } catch (error) {
      console.error(new Date(), "Error:", error);

      res
        .status(500)
        .send(
          `<script>alert("Error while Saving!"); window.location.href="/form_registration(L4JM).html";</script>`
        );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
);

app.get("/retrieve_fregl4jm", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl4jm1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl4jm2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl4jm3", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fregl4jm WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_fregl2", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fregl2_tname, rowsOfData } = req.body;

    if (!indexnum || !fregl2_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fregl2_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        CourseCredit VARCHAR(25)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fregl2_tname} (CourseNo, CourseName, CourseCredit) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(L2).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(L2).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_fregl21", upload.single("fregl2_rec"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const {
      indexnum,
      fregl2_ay,
      fregl2_cn,
      fregl2_choi,
      fregl2_dpay,
      fregl2_recno,
      fregl2_tname,
    } = req.body;

    const fregl2_recPath = req.file ? req.file.path : null;
    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_fregl2 (indexnum,fregl2_ay,fregl2_cn,fregl2_choi,fregl2_dpay,fregl2_recno,fregl2_rec,fregl2_tname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      fregl2_ay = VALUES(fregl2_ay),
      fregl2_cn = VALUES(fregl2_cn),
      fregl2_choi = VALUES(fregl2_choi),
      fregl2_dpay = VALUES(fregl2_dpay),
      fregl2_recno = VALUES(fregl2_recno),
      fregl2_rec = VALUES(fregl2_rec),
      fregl2_tname = VALUES(fregl2_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      fregl2_ay,
      fregl2_cn,
      fregl2_choi,
      fregl2_dpay,
      fregl2_recno,
      fregl2_recPath,
      fregl2_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(L2).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(L2).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_fregl2", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl21", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl22", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl23", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fregl2 WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/upload_fregl1", upload.single("file"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log("Request body:", req.body);

    const { indexnum, fregl1_tname, rowsOfData } = req.body;

    if (!indexnum || !fregl1_tname) {
      console.error("Invalid index number or table name");
      return res.status(400).send("Invalid index number or table name");
    }

    connection = await mysql.createConnection(connectionConfig);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`${fregl1_tname}\` (
        CourseNo VARCHAR(25),
        CourseName VARCHAR(100),
        CourseCredit VARCHAR(25)
      )
    `;

    await connection.query(createTableSql);

    if (!rowsOfData || !Array.isArray(rowsOfData) || rowsOfData.length === 0) {
      console.error("Invalid data format in the request body");
      return res.status(400).send("Invalid data format");
    }

    const newTableSql = `
      INSERT INTO ${fregl1_tname} (CourseNo, CourseName, CourseCredit) VALUES ?`;
    const values = rowsOfData.map((row) => [...row]);

    await connection.query(newTableSql, [values]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(L1).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);
    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(L1).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.post("/upload_fregl11", upload.single("fregl1_rec"), async (req, res) => {
  let connection;

  try {
    console.log(req.file);
    console.log(req.body);

    const { indexnum, fregl1_ay, fregl1_cn, fregl1_choi, fregl1_tname } =
      req.body;

    connection = await mysql.createConnection(connectionConfig);

    const sql = `
      INSERT INTO t_fregl1 (indexnum,fregl1_ay,fregl1_cn,fregl1_choi,fregl1_tname)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      fregl1_ay = VALUES(fregl1_ay),
      fregl1_cn = VALUES(fregl1_cn),
      fregl1_choi = VALUES(fregl1_choi),
      fregl1_tname = VALUES(fregl1_tname)
    `;

    const result = await connection.query(sql, [
      indexnum,
      fregl1_ay,
      fregl1_cn,
      fregl1_choi,
      fregl1_tname,
    ]);

    res.send(
      `<script>alert("Successfully Saved!");window.location.href="/form_registration(L1).html";</script>`
    );
  } catch (error) {
    console.error(new Date(), "Error:", error);

    res
      .status(500)
      .send(
        `<script>alert("Error while Saving!"); window.location.href="/form_registration(L1).html";</script>`
      );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get("/retrieve_fregl1", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profilePI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl11", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileAI WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl12", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_profileCon WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.get("/retrieve_fregl13", (req, res) => {
  const searchInput = req.query.search || "";
  const retrieveQuery = `SELECT * FROM t_fregl1 WHERE indexnum LIKE '%${searchInput}%'`;

  connection.query(retrieveQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
    } else {
      console.log("Data retrieved successfully1");
      res.status(200).json(results);
    }
  });
});

app.post("/import_fregl4jm", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fregl4jm (indexnum,  fregl4jm_ay, fregl4jm_cn, fregl4jm_choi, fregl4jm_dpay, fregl4jm_recno, fregl4jm_rec, fregl4jm_tname) " +
          "VALUES (?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fregl4jm_ay = VALUES(fregl4jm_ay), " +
          "fregl4jm_cn = VALUES(fregl4jm_cn), " +
          "fregl4jm_choi = VALUES(fregl4jm_choi), " +
          "fregl4jm_dpay = VALUES(fregl4jm_dpay), " +
          "fregl4jm_recno = VALUES(fregl4jm_recno), " +
          "fregl4jm_rec = VALUES(fregl4jm_rec), " +
          "fregl4jm_tname = VALUES(fregl4jm_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fregl4jm_ay,
            row.fregl4jm_cn,
            row.fregl4jm_choi,
            row.fregl4jm_dpay,
            row.fregl4jm_recno,
            row.fregl4jm_rec,
            row.fregl4jm_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fregl4jm/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fregl4jm WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fregl4jm", (req, res) => {
  connection.query("SELECT * FROM t_fregl4jm", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fregl4jm_ay}</td>
        <td>${row.fregl4jm_cn}</td>
        <td>${row.fregl4jm_choi}</td>
        <td>${row.fregl4jm_dpay}</td>
        <td>${row.fregl4jm_recno}</td>
        <td><img src="${row.fregl4jm_rec}" alt="Record" style="max-width: 75px; max-height: 75px; cursor: pointer;" onclick="toggleImage(this)"></td>
        <td>${row.fregl4jm_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_fregl4jm", (req, res) => {
  const {
    indexnum,
    fregl4jm_ay,
    fregl4jm_cn,
    fregl4jm_choi,
    fregl4jm_dpay,
    fregl4jm_recno,
    fregl4jm_rec,
    fregl4jm_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_fregl4jm (indexnum,   fregl4jm_ay, fregl4jm_cn, fregl4jm_choi, fregl4jm_dpay, fregl4jm_recno, fregl4jm_rec, fregl4jm_tname) " +
    "VALUES (?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fregl4jm_ay = VALUES(fregl4jm_ay), " +
    "fregl4jm_cn = VALUES(fregl4jm_cn), " +
    "fregl4jm_choi = VALUES(fregl4jm_choi), " +
    "fregl4jm_dpay = VALUES(fregl4jm_dpay), " +
    "fregl4jm_recno = VALUES(fregl4jm_recno), " +
    "fregl4jm_rec = VALUES(fregl4jm_rec), " +
    "fregl4jm_tname = VALUES(fregl4jm_tname)";

  connection.query(
    sql,
    [
      indexnum,
      fregl4jm_ay,
      fregl4jm_cn,
      fregl4jm_choi,
      fregl4jm_dpay,
      fregl4jm_recno,
      fregl4jm_rec,
      fregl4jm_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.put("/update_fregl4jm/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const {
    fregl4jm_ay,
    fregl4jm_cn,
    fregl4jm_choi,
    fregl4jm_dpay,
    fregl4jm_recno,
    fregl4jm_rec,
    fregl4jm_tname,
  } = req.body;

  const sql =
    "UPDATE t_fregl4jm SET " +
    "fregl4jm_ay = ?, " +
    "fregl4jm_cn = ?, " +
    "fregl4jm_choi = ?, " +
    "fregl4jm_dpay = ?, " +
    "fregl4jm_recno = ?, " +
    "fregl4jm_rec = ?, " +
    "fregl4jm_tname = ? " +
    "WHERE indexnum = ?";

  connection.query(
    sql,
    [
      fregl4jm_ay,
      fregl4jm_cn,
      fregl4jm_choi,
      fregl4jm_dpay,
      fregl4jm_recno,
      fregl4jm_rec,
      fregl4jm_tname,
      indexnum,
    ],
    (error) => {
      if (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data updated successfully");
    }
  );
});

app.get("/search_fregl4jm/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fregl4jm WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
      <tr>
        <td>${row.indexnum}</td>
        <td>${row.fregl4jm_ay}</td>
        <td>${row.fregl4jm_cn}</td>
        <td>${row.fregl4jm_choi}</td>
        <td>${row.fregl4jm_dpay}</td>
        <td>${row.fregl4jm_recno}</td>
        <td>${row.fregl4jm_rec}</td>
        <td>${row.fregl4jm_tname}</td>
      </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Full Name (Salutation)</th>
          <th>First Name</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
    `;

    res.send(tableHTML);
  });
});

app.get("/export_fregl4jm_csv", (req, res) => {
  const sql = "SELECT * FROM t_fregl4jm";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fregl4jm_ay,
        row.fregl4jm_cn,
        row.fregl4jm_choi,
        row.fregl4jm_dpay,
        row.fregl4jm_recno,
        row.fregl4jm_rec,
        row.fregl4jm_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fregl4jmtable", (req, res) => {
  const tname = req.query.tname;
  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
        <table class="table table-bordered">
          <tr>
            <th>CourseNo</th>
            <th>CourseName</th>
            <th>CourseCredit</th>
          </tr>
          ${results
            .map(
              (row) => `
            <tr>
              <td>${row.CourseNo}</td>
              <td>${row.CourseName}</td>
              <td>${row.CourseCredit}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;

    res.send(dataHTML);
  });
});

app.post("/import_fregl4sp", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fregl4sp (indexnum,   fregl4sp_ay, fregl4sp_cn, fregl4sp_choi, fregl4sp_dpay, fregl4sp_recno, fregl4sp_rec, fregl4sp_tname) " +
          "VALUES (?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fregl4sp_ay = VALUES(fregl4sp_ay), " +
          "fregl4sp_cn = VALUES(fregl4sp_cn), " +
          "fregl4sp_choi = VALUES(fregl4sp_choi), " +
          "fregl4sp_dpay = VALUES(fregl4sp_dpay), " +
          "fregl4sp_recno = VALUES(fregl4sp_recno), " +
          "fregl4sp_rec = VALUES(fregl4sp_rec), " +
          "fregl4sp_tname = VALUES(fregl4sp_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fregl4sp_ay,
            row.fregl4sp_cn,
            row.fregl4sp_choi,
            row.fregl4sp_dpay,
            row.fregl4sp_recno,
            row.fregl4sp_rec,
            row.fregl4sp_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fregl4sp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fregl4sp WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fregl4sp", (req, res) => {
  connection.query("SELECT * FROM t_fregl4sp", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
        <tr>
          <td>${row.indexnum}</td>
          <td>${row.fregl4sp_ay}</td>
          <td>${row.fregl4sp_cn}</td>
          <td>${row.fregl4sp_choi}</td>
          <td>${row.fregl4sp_dpay}</td>
          <td>${row.fregl4sp_recno}</td>
          <td><img src="${row.fregl4sp_rec}" alt="Record" style="max-width: 75px; max-height: 75px; cursor: pointer;" onclick="toggleImage(this)"></td>
          <td>${row.fregl4sp_tname}</td>
        </tr>`
      )
      .join("");

    const tableHTML = `
        <table class="table table-bordered">
          <tr>
            <th>Index</th>
            <th>Academic Year</th>
            <th>CN</th>
            <th>CHOI</th>
            <th>DPAY</th>
            <th>Record Number</th>
            <th>Record</th>
            <th>Table Name</th>
          </tr>
          ${tableRows}
        </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
      `;

    res.send(tableHTML);
  });
});

app.post("/add_fregl4sp", (req, res) => {
  const {
    indexnum,
    fregl4sp_ay,
    fregl4sp_cn,
    fregl4sp_choi,
    fregl4sp_dpay,
    fregl4sp_recno,
    fregl4sp_rec,
    fregl4sp_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_fregl4sp (indexnum, fregl4sp_ay, fregl4sp_cn, fregl4sp_choi, fregl4sp_dpay, fregl4sp_recno, fregl4sp_rec, fregl4sp_tname) " +
    "VALUES (?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fregl4sp_ay = VALUES(fregl4sp_ay), " +
    "fregl4sp_cn = VALUES(fregl4sp_cn), " +
    "fregl4sp_choi = VALUES(fregl4sp_choi), " +
    "fregl4sp_dpay = VALUES(fregl4sp_dpay), " +
    "fregl4sp_recno = VALUES(fregl4sp_recno), " +
    "fregl4sp_rec = VALUES(fregl4sp_rec), " +
    "fregl4sp_tname = VALUES(fregl4sp_tname)";

  connection.query(
    sql,
    [
      indexnum,
      fregl4sp_ay,
      fregl4sp_cn,
      fregl4sp_choi,
      fregl4sp_dpay,
      fregl4sp_recno,
      fregl4sp_rec,
      fregl4sp_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.put("/update_fregl4sp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const {
    fregl4sp_ay,
    fregl4sp_cn,
    fregl4sp_choi,
    fregl4sp_dpay,
    fregl4sp_recno,
    fregl4sp_rec,
    fregl4sp_tname,
  } = req.body;

  const sql =
    "UPDATE t_fregl4sp SET " +
    "fregl4sp_ay = ?, " +
    "fregl4sp_cn = ?, " +
    "fregl4sp_choi = ?, " +
    "fregl4sp_dpay = ?, " +
    "fregl4sp_recno = ?, " +
    "fregl4sp_rec = ?, " +
    "fregl4sp_tname = ? " +
    "WHERE indexnum = ?";

  connection.query(
    sql,
    [
      fregl4sp_ay,
      fregl4sp_cn,
      fregl4sp_choi,
      fregl4sp_dpay,
      fregl4sp_recno,
      fregl4sp_rec,
      fregl4sp_tname,
      indexnum,
    ],
    (error) => {
      if (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data updated successfully");
    }
  );
});

app.get("/search_fregl4sp/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fregl4sp WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
        <tr>
          <td>${row.indexnum}</td>
          <td>${row.fregl4sp_ay}</td>
          <td>${row.fregl4sp_cn}</td>
          <td>${row.fregl4sp_choi}</td>
          <td>${row.fregl4sp_dpay}</td>
          <td>${row.fregl4sp_recno}</td>
          <td>${row.fregl4sp_rec}</td>
          <td>${row.fregl4sp_tname}</td>
        </tr>`
      )
      .join("");

    const tableHTML = `
        <table class="table table-bordered">
          <tr>
            <th>Index</th>
            <th>Full Name (Salutation)</th>
            <th>First Name</th>
            <th>Academic Year</th>
            <th>CN</th>
            <th>CHOI</th>
            <th>DPAY</th>
            <th>Record Number</th>
            <th>Record</th>
            <th>Table Name</th>
          </tr>
          ${tableRows}
        </table>
      `;

    res.send(tableHTML);
  });
});

app.get("/export_fregl4sp_csv", (req, res) => {
  const sql = "SELECT * FROM t_fregl4sp";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fregl4sp_ay,
        row.fregl4sp_cn,
        row.fregl4sp_choi,
        row.fregl4sp_dpay,
        row.fregl4sp_recno,
        row.fregl4sp_rec,
        row.fregl4sp_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fregl4sptable", (req, res) => {
  const tname = req.query.tname;
  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
          <table class="table table-bordered">
            <tr>
              <th>CourseNo</th>
              <th>CourseName</th>
              <th>CourseCredit</th>
            </tr>
            ${results
              .map(
                (row) => `
              <tr>
                <td>${row.CourseNo}</td>
                <td>${row.CourseName}</td>
                <td>${row.CourseCredit}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        `;

    res.send(dataHTML);
  });
});

app.post("/import_fregl2", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fregl2 (indexnum,   fregl2_ay, fregl2_cn, fregl2_choi, fregl2_dpay, fregl2_recno, fregl2_rec, fregl2_tname) " +
          "VALUES (?,?,?,?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fregl2_ay = VALUES(fregl2_ay), " +
          "fregl2_cn = VALUES(fregl2_cn), " +
          "fregl2_choi = VALUES(fregl2_choi), " +
          "fregl2_dpay = VALUES(fregl2_dpay), " +
          "fregl2_recno = VALUES(fregl2_recno), " +
          "fregl2_rec = VALUES(fregl2_rec), " +
          "fregl2_tname = VALUES(fregl2_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fregl2_ay,
            row.fregl2_cn,
            row.fregl2_choi,
            row.fregl2_dpay,
            row.fregl2_recno,
            row.fregl2_rec,
            row.fregl2_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fregl2/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fregl2 WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fregl2", (req, res) => {
  connection.query("SELECT * FROM t_fregl2", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
          <tr>
            <td>${row.indexnum}</td>
            <td>${row.fregl2_ay}</td>
            <td>${row.fregl2_cn}</td>
            <td>${row.fregl2_choi}</td>
            <td>${row.fregl2_dpay}</td>
            <td>${row.fregl2_recno}</td>
            <td><img src="${row.fregl2_rec}" alt="Record" style="max-width: 75px; max-height: 75px; cursor: pointer;" onclick="toggleImage(this)"></td>
            <td>${row.fregl2_tname}</td>
          </tr>`
      )
      .join("");

    const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Index</th>
          <th>Academic Year</th>
          <th>CN</th>
          <th>CHOI</th>
          <th>DPAY</th>
          <th>Record Number</th>
          <th>Record</th>
          <th>Table Name</th>
        </tr>
        ${tableRows}
      </table>
      <div id="largerImageContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 9999; text-align: center;">
        <img id="largerImage" src="" style="max-width: 80%; max-height: 80%; margin-top: 10%; cursor: pointer;" onclick="hideLargerImage()">
      </div>
    `;

    res.send(tableHTML);
  });
});

app.post("/add_fregl2", (req, res) => {
  const {
    indexnum,
    fregl2_ay,
    fregl2_cn,
    fregl2_choi,
    fregl2_dpay,
    fregl2_recno,
    fregl2_rec,
    fregl2_tname,
  } = req.body;

  const sql =
    "INSERT INTO t_fregl2 (indexnum, fregl2_ay, fregl2_cn, fregl2_choi, fregl2_dpay, fregl2_recno, fregl2_rec, fregl2_tname) " +
    "VALUES (?,?,?,?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fregl2_ay = VALUES(fregl2_ay), " +
    "fregl2_cn = VALUES(fregl2_cn), " +
    "fregl2_choi = VALUES(fregl2_choi), " +
    "fregl2_dpay = VALUES(fregl2_dpay), " +
    "fregl2_recno = VALUES(fregl2_recno), " +
    "fregl2_rec = VALUES(fregl2_rec), " +
    "fregl2_tname = VALUES(fregl2_tname)";

  connection.query(
    sql,
    [
      indexnum,
      fregl2_ay,
      fregl2_cn,
      fregl2_choi,
      fregl2_dpay,
      fregl2_recno,
      fregl2_rec,
      fregl2_tname,
    ],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.put("/update_fregl2/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const {
    fregl2_ay,
    fregl2_cn,
    fregl2_choi,
    fregl2_dpay,
    fregl2_recno,
    fregl2_rec,
    fregl2_tname,
  } = req.body;

  const sql =
    "UPDATE t_fregl2 SET " +
    "fregl2_ay = ?, " +
    "fregl2_cn = ?, " +
    "fregl2_choi = ?, " +
    "fregl2_dpay = ?, " +
    "fregl2_recno = ?, " +
    "fregl2_rec = ?, " +
    "fregl2_tname = ? " +
    "WHERE indexnum = ?";

  connection.query(
    sql,
    [
      fregl2_ay,
      fregl2_cn,
      fregl2_choi,
      fregl2_dpay,
      fregl2_recno,
      fregl2_rec,
      fregl2_tname,
      indexnum,
    ],
    (error) => {
      if (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data updated successfully");
    }
  );
});

app.get("/search_fregl2/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fregl2 WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
          <tr>
            <td>${row.indexnum}</td>
            <td>${row.fregl2_ay}</td>
            <td>${row.fregl2_cn}</td>
            <td>${row.fregl2_choi}</td>
            <td>${row.fregl2_dpay}</td>
            <td>${row.fregl2_recno}</td>
            <td>${row.fregl2_rec}</td>
            <td>${row.fregl2_tname}</td>
          </tr>`
      )
      .join("");

    const tableHTML = `
          <table class="table table-bordered">
            <tr>
              <th>Index</th>
              <th>Full Name (Salutation)</th>
              <th>First Name</th>
              <th>Academic Year</th>
              <th>CN</th>
              <th>CHOI</th>
              <th>DPAY</th>
              <th>Record Number</th>
              <th>Record</th>
              <th>Table Name</th>
            </tr>
            ${tableRows}
          </table>
        `;

    res.send(tableHTML);
  });
});

app.get("/export_fregl2_csv", (req, res) => {
  const sql = "SELECT * FROM t_fregl2";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fregl2_ay,
        row.fregl2_cn,
        row.fregl2_choi,
        row.fregl2_dpay,
        row.fregl2_recno,
        row.fregl2_rec,
        row.fregl2_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fregl2table", (req, res) => {
  const tname = req.query.tname;
  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
            <table class="table table-bordered">
              <tr>
                <th>CourseNo</th>
                <th>CourseName</th>
                <th>CourseCredit</th>
              </tr>
              ${results
                .map(
                  (row) => `
                <tr>
                  <td>${row.CourseNo}</td>
                  <td>${row.CourseName}</td>
                  <td>${row.CourseCredit}</td>
                </tr>
              `
                )
                .join("")}
            </table>
          `;

    res.send(dataHTML);
  });
});

app.post("/import_fregl1", upload1.single("csvFile"), (req, res) => {
  try {
    const csvFile = req.file;
    if (!csvFile) {
      throw new Error("No file uploaded.");
    }

    const results = [];
    const csvStream = csvParser()
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const sql =
          "INSERT INTO t_fregl1 (indexnum,   fregl1_ay, fregl1_cn, fregl1_choi, fregl1_tname) " +
          "VALUES (?,?,?,?,?) " +
          "ON DUPLICATE KEY UPDATE " +
          "fregl1_ay = VALUES(fregl1_ay), " +
          "fregl1_cn = VALUES(fregl1_cn), " +
          "fregl1_choi = VALUES(fregl1_choi), " +
          "fregl1_tname = VALUES(fregl1_tname)";

        results.forEach((row) => {
          const values = [
            row.indexnum,
            row.fregl1_ay,
            row.fregl1_cn,
            row.fregl1_choi,
            row.fregl1_tname,
          ];

          connection.query(sql, values, (error) => {
            if (error) {
              console.error("Error inserting data:", error);
              res.status(500).send("Internal Server Error");
              return;
            }
          });
        });

        res.send("Data imported successfully");
      });

    const stream = require("stream");
    const readableStream = new stream.PassThrough();
    readableStream.end(csvFile.buffer);
    readableStream.pipe(csvStream);
  } catch (error) {
    console.error("Error importing data:", error.message);
    res.status(400).send(error.message);
  }
});

app.delete("/delete_fregl1/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;
  console.log("Deleting data for indexnum:", indexnum);

  const deleteSql = "DELETE FROM t_fregl1 WHERE indexnum = ?";
  connection.query(deleteSql, [indexnum], (deleteError, results) => {
    if (deleteError) {
      console.error("Error deleting data:", deleteError);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data deleted successfully");
    res.send("Data deleted successfully");
  });
});

app.get("/getall_fregl1", (req, res) => {
  connection.query("SELECT * FROM t_fregl1", (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
            <tr>
              <td>${row.indexnum}</td>
              <td>${row.fregl1_ay}</td>
              <td>${row.fregl1_cn}</td>
              <td>${row.fregl1_choi}</td>
              <td>${row.fregl1_tname}</td>
            </tr>`
      )
      .join("");

    const tableHTML = `
            <table class="table table-bordered">
              <tr>
                <th>Index</th>
                <th>Academic Year</th>
                <th>CN</th>
                <th>CHOI</th>
                <th>Table Name</th>
              </tr>
              ${tableRows}
            </table>
          `;

    res.send(tableHTML);
  });
});

app.post("/add_fregl1", (req, res) => {
  const { indexnum, fregl1_ay, fregl1_cn, fregl1_choi, fregl1_tname } =
    req.body;

  const sql =
    "INSERT INTO t_fregl1 (indexnum, fregl1_ay, fregl1_cn, fregl1_choi, fregl1_tname) " +
    "VALUES (?,?,?,?,?) " +
    "ON DUPLICATE KEY UPDATE " +
    "fregl1_ay = VALUES(fregl1_ay), " +
    "fregl1_cn = VALUES(fregl1_cn), " +
    "fregl1_choi = VALUES(fregl1_choi), " +
    "fregl1_tname = VALUES(fregl1_tname)";

  connection.query(
    sql,
    [indexnum, fregl1_ay, fregl1_cn, fregl1_choi, fregl1_tname],
    (error) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data inserted successfully");
    }
  );
});

app.put("/update_fregl1/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const { fregl1_ay, fregl1_cn, fregl1_choi, fregl1_tname } = req.body;

  const sql =
    "UPDATE t_fregl1 SET " +
    "fregl1_ay = ?, " +
    "fregl1_cn = ?, " +
    "fregl1_choi = ?, " +
    "fregl1_tname = ? " +
    "WHERE indexnum = ?";

  connection.query(
    sql,
    [fregl1_ay, fregl1_cn, fregl1_choi, fregl1_tname, indexnum],
    (error) => {
      if (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.send("Data updated successfully");
    }
  );
});

app.get("/search_fregl1/:indexnum", (req, res) => {
  const indexnum = req.params.indexnum;

  const sql = "SELECT * FROM t_fregl1 WHERE indexnum = ?";
  connection.query(sql, [indexnum], (error, results, fields) => {
    if (error) {
      console.error("Error searching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tableRows = results
      .map(
        (row) => `
            <tr>
              <td>${row.indexnum}</td>
              <td>${row.fregl1_ay}</td>
              <td>${row.fregl1_cn}</td>
              <td>${row.fregl1_choi}</td>
              <td>${row.fregl1_tname}</td>
            </tr>`
      )
      .join("");

    const tableHTML = `
            <table class="table table-bordered">
              <tr>
                <th>Index</th>
                <th>Full Name (Salutation)</th>
                <th>First Name</th>
                <th>Academic Year</th>
                <th>CN</th>
                <th>CHOI</th>
                <th>Table Name</th>
              </tr>
              ${tableRows}
            </table>
          `;

    res.send(tableHTML);
  });
});

app.get("/export_fregl1_csv", (req, res) => {
  const sql = "SELECT * FROM t_fregl1";
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    const csvData = results.map((row) => {
      return [
        row.indexnum,
        row.fregl1_ay,
        row.fregl1_cn,
        row.fregl1_choi,
        row.fregl1_tname,
      ].join(",");
    });

    csvData.unshift(Object.keys(results[0]).join(","));

    const csvContent = csvData.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exported_data.csv"
    );
    res.status(200).send(csvContent);
  });
});

app.get("/getall_fregl1table", (req, res) => {
  const tname = req.query.tname;
  const query = `SELECT * FROM \`${tname}\``;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(500).send("Internal Server Error");
      return;
    }

    const dataHTML = `
              <table class="table table-bordered">
                <tr>
                  <th>CourseNo</th>
                  <th>CourseName</th>
                  <th>CourseCredit</th>
                </tr>
                ${results
                  .map(
                    (row) => `
                  <tr>
                    <td>${row.CourseNo}</td>
                    <td>${row.CourseName}</td>
                    <td>${row.CourseCredit}</td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
            `;

    res.send(dataHTML);
  });
});

app.get("/retrieve_feregpr_st", (req, res) => {
  const tname = req.query.tname;
  const retrieveQuery = `SELECT CourseNo, CourseName FROM ??`;

  connection.query(retrieveQuery, [tname], (err, results) => {
    if (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        res.status(200).json([]);
      } else {
        console.error("Error retrieving data:", err);
        res.status(500).json({ error: "Error retrieving data" });
      }
    } else {
      console.log("Data retrieved successfully:", results);
      res.status(200).json(results);
    }
  });
});

app.get("/datalist_No", (req, res) => {
  const query = "SELECT CourseNo FROM t_subject";
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error("Error executing query: " + error.stack);
      res.status(500).send("Error fetching from database");
      return;
    }
    const CourseNo = results.map((result) => result.CourseNo);
    res.json(CourseNo);
  });
});
app.get("/datalist_Name", (req, res) => {
  const query = "SELECT CourseName FROM t_subject";
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error("Error executing query: " + error.stack);
      res.status(500).send("Error fetching from database");
      return;
    }
    const CourseName = results.map((result) => result.CourseName);
    res.json(CourseName);
  });
});

app.post("/insertCourse", (req, res) => {
  const { CourseNo, CourseName } = req.body;

  const query =
      "INSERT INTO t_subject (CourseNo, CourseName) VALUES (?, ?) ON DUPLICATE KEY UPDATE CourseName=VALUES(CourseName);";
  const values = [CourseNo, CourseName];

  connection.query(query, values, (err, results) => {
      if (err) {
          console.error("Error inserting data into MySQL:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      res.json({ success: true, insertedId: results.insertId });
  });
});


app.delete("/deleteCourse/:CourseNo", (req, res) => {
  const CourseNoToDelete = req.params.CourseNo;

  const deleteQuery = `
    DELETE FROM t_subject
    WHERE CourseNo = ?
  `;

  connection.query(deleteQuery, [CourseNoToDelete], (err, result) => {
    if (err) {
      console.error("Error deleting course:", err);
      res.json({
        success: false,
        message: "Error deleting course. Please try again.",
      });
    } else if (result.affectedRows === 0) {
      res.json({ success: false, message: "Course not found" });
    } else {
      console.log("Deleted successfully:", result);
      res.json({ success: true, message: "Course deleted successfully" });
    }
  });
});

app.get("/getall_subject", (req, res) => {
  connection.query(
    "SELECT CourseNo, CourseName FROM t_subject",
    (error, results, fields) => {
      if (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      const tableRows = results
        .map(
          (row) => `
      <tr>
        <td>${row.CourseNo}</td>
        <td>${row.CourseName}</td>
      </tr>`
        )
        .join("");

      const tableHTML = `
      <table class="table table-bordered">
        <tr>
          <th>Course Number</th>
          <th>Course Name</th>
        </tr>
        ${tableRows}
      </table>
    `;

      res.send(tableHTML);
    }
  );
});
