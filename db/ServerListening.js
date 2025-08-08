require("dotenv").config(); 
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const ServerListening = async (app) => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("POrt Can't be Served", error.message);
    process.exit(1);
  }
};

module.exports = ServerListening;