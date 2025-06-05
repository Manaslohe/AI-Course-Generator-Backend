const mongoose = require("mongoose");

const connectWithDb = () => {
  const dbUrl = process.env.MONGO_URI;

  console.log("MONGO_URI:", dbUrl); // Updated debug log

  if (!dbUrl || typeof dbUrl !== "string") {
    console.error("MONGO_URI environment variable is not defined or invalid.");
    process.exit(1);
  }

  mongoose
    .connect(dbUrl.trim())
    .then(() => console.log(`DB GOT CONNECTED`))
    .catch((error) => {
      console.error(`DB CONNECTION ISSUES`);
      console.error(error.message);
      process.exit(1);
    });
};

module.exports = connectWithDb;
