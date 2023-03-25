const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");

//...........................................................................
//........................................................................
const checkPassword = (password) => {
  if (password.length < 5) {
    return false;
  } else {
    return true;
  }
};
//........................................................................
//........................................................................

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1 --- Path: `/register` --- Method: `POST`

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user
                           WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    if (checkPassword(password) === true) {
      const createUserQuery = `INSERT INTO 
                                 user(username, name, password, gender, location)
                                 VALUES(
                                     '${username}',
                                     '${name}',
                                     '${hashedPassword}',
                                     '${gender}',
                                     '${location}');`;
      await db.run(createUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// API 2 --- Path: `/login` ---  Method: `POST`

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const passwordMatched = await bcrypt.compare(password, dbUser.password);
    if (passwordMatched === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// API 3 --- Path: `/change-password` --- Method: `PUT`

app.put("/change-password/", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);

  if (checkPassword(newPassword) === true) {
    const OldPasswordMatched = await bcrypt.compare(
      oldPassword,
      dbUser.password
    );
    if (OldPasswordMatched === true) {
      const changePasswordQuery = `UPDATE user 
                                   SET password = '${hashedPassword}';`;
      await db.run(changePasswordQuery);
      response.send("Password updated");
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  } else {
    response.status(400);
    response.send("Password is too short");
  }
});

module.exports = app;
