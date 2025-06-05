require("dotenv").config(); // Ensure dotenv is loaded first

const app = require("./app");
const connectWithDb = require("./config/db");

// Connect with the database
connectWithDb();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
