const mysql = require("mysql2/promise");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const app = express();
const cors = require("cors");

const corsOptions = {
  origin: function (origin, callback) {
    const allowlist = [
      "http://localhost",
      "http://localhost:3000",
      "http://apps.7cav.us",
      "https://apps.7cav.us",
      "https://apps.7cav.us/",
      "http://appsbeta.7cav.us",
      "https://appsbeta.7cav.us",
      "https://appsbeta.7cav.us/",
    ];
    if (allowlist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(
  cors({
    origin: corsOptions.origin,
  }),
);

async function updateCache() {
  console.log(
    `[${new Date().toISOString()}] Starting MariaDB to SQLite sync...`,
  );

  const mariaConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  let liteDB;

  try {
    const [rows] = await mariaConnection.execute(
      `SELECT xu.username 
       FROM xenforo.xf_user AS xu
       WHERE xu.username REGEXP '^[A-Za-z]+\\\\.[A-Z]{1,2}$'`,
    );

    console.log(
      `Fetched ${rows.length} valid members. Updating local cache...`,
    );

    liteDB = await open({
      filename: "./cache.db",
      driver: sqlite3.Database,
    });

    await liteDB.exec("BEGIN TRANSACTION");

    await liteDB.exec(
      "CREATE TABLE IF NOT EXISTS search_index (username TEXT)",
    );

    await liteDB.exec("DELETE FROM search_index");

    const insert = await liteDB.prepare(
      "INSERT INTO search_index (username) VALUES (?)",
    );

    for (const row of rows) {
      await insert.run(row.username);
    }

    await insert.finalize();

    await liteDB.exec("COMMIT");

    console.log("Local SQLite cache successfully updated.");
  } catch (err) {
    console.error("Sync Error:", err.message);

    if (liteDB) {
      await liteDB.exec("ROLLBACK");
    }
  } finally {
    if (mariaConnection) {
      await mariaConnection.end();
    }

    if (liteDB) {
      await liteDB.close();
    }
  }
}

app.get("/sql/search", async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm || searchTerm.length < 3) {
    return res.json([]);
  }

  let db;

  try {
    db = await open({
      filename: "./cache.db",
      driver: sqlite3.Database,
    });

    //basic sanitization
    const sanitizedSearch = searchTerm
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");

    const results = await db.all(
      "SELECT username FROM search_index WHERE username LIKE ? ESCAPE '\\' LIMIT 11",
      [`${sanitizedSearch}%`],
    );

    let usernames = results.map((row) => row.username);

    if (usernames.length >= 11) {
      usernames.pop();
      usernames.push("...");
    }

    res.json(usernames);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  } finally {
    if (db) {
      await db.close();
    }
  }
});

updateCache();
setInterval(updateCache, 1000 * 60 * 60);

app.listen(5000, () => console.log("Cache API listening on 5000..."));
