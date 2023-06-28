const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

// Create SQLite database connection
const db = new sqlite3.Database(":memory:"); // Change to a file path if you want to persist the database

// Create customers table
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone_number TEXT UNIQUE)"
  );

  // Insert an admin customer
  const adminCustomer = {
    name: "Admin",
    phone_number: "1234567890",
  };
  db.run("INSERT OR IGNORE INTO customers (name, phone_number) VALUES (?, ?)", [
    adminCustomer.name,
    adminCustomer.phone_number,
  ]);
});

// Middleware for parsing request bodies
app.use(bodyParser.json());

// Add Customer API - assume admin is adding customer
app.post("/api/customers", (req, res) => {
  const { name, phone_number } = req.body;

  // Validate input params
  if (!name || !phone_number) {
    return res
      .status(400)
      .json({ error: "Name and phone number are required" });
  }

  // Check for duplicates
  db.get(
    "SELECT * FROM customers WHERE phone_number = ?",
    [phone_number],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "An unexpected error occurred" });
      }

      if (row) {
        return res
          .status(409)
          .json({
            error: "Customer with the provided phone number already exists",
          });
      }

      // Insert new customer
      db.run(
        "INSERT INTO customers (name, phone_number) VALUES (?, ?)",
        [name, phone_number],
        function (err) {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ error: "An unexpected error occurred" });
          }

          const insertedCustomerId = this.lastID;
          res.json({
            message: "Customer added successfully",
            customerId: insertedCustomerId,
          });
        }
      );
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
