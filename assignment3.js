const mysql = require("mysql");

const customers = [
  {
    email: "anurag11@yopmail.com",
    name: "anurag",
  },
  {
    email: "sameer11@yopmail.com",
    name: "sameer",
  },
  {
    email: "ravi11@yopmail.com",
    name: "ravi",
  },
  {
    email: "akash11@yopmail.com",
    name: "akash",
  },
  {
    email: "anjali11@yopmail.com",
    name: "anjali",
  },
  {
    email: "santosh11@yopmail.com",
    name: "santosh",
  },
];

// Create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "your_username",
  password: "your_password",
  database: "your_database",
});

// Function to insert customers into the database
function insertCustomers(customers) {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return;
    }

    console.log("Connected to the database.");

    // Iterate over the customers array
    customers.forEach((customer) => {
      // Check if the email already exists in the database
      connection.query(
        "SELECT * FROM customers WHERE email = ?",
        [customer.email],
        (error, results) => {
          if (error) {
            console.error("Error executing the SELECT query:", error);
            return;
          }

          // If the email exists, log the customer name
          if (results.length > 0) {
            console.log(
              `Email '${customer.email}' already exists. Name: '${results[0].name}'`
            );
          } else {
            // If the email doesn't exist, insert the customer into the database
            connection.query(
              "INSERT INTO customers (email, name) VALUES (?, ?)",
              [customer.email, customer.name],
              (err) => {
                if (err) {
                  console.error("Error executing the INSERT query:", err);
                  return;
                }
                console.log(
                  `Customer '${customer.name}' inserted successfully.`
                );
              }
            );
          }
        }
      );
    });

    // Close the connection
    connection.end((err) => {
      if (err) {
        console.error("Error closing the database connection:", err);
        return;
      }
      console.log("Database connection closed.");
    });
  });
}

// Call the insertCustomers function
insertCustomers(customers);
