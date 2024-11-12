// Webserver using express.js and Node.js
// Use: 'npm start' to start the script which runs the server.
// Use: ctrl ^c to stop the server.

const express = require("express");
//const path = require("path");
//const http = require("http");
//const morgan = require("morgan");
const db = require("./mongoDB"); // Make sure this is correctly configured in mongoDB.js

// Calls the express function to start a new Express application
const app = express();

// Middleware to log requests
//app.use(morgan("dev"));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to log additional request details
app.use((request, response, next) => {
  console.log(
    "Request coming in: " +
      request.method +
      " to " +
      request.url +
      "\nRequest IP: " +
      request.ip +
      "\nRequest date: " +
      new Date()
  );
  next();
});

// Error handling middleware.
app.use((error, req, res, next) => {
  console.error("Error encountered:", err);
  res.status(500).json({ error: "An internal error occurred" });
});

// MongoDB route parameter to fetch all documents in a collection.
app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});
// Get route to attain the data stored in a collection, using the parameter 'collectionName'.
app.get("/collections/:collectionName", async (req, res, next) => {
  try {
    const results = await req.collection.find({}).toArray();
    res.json(results); // Respond with the result in JSON format.
  } catch (error) {
    next(error);
  }
});

// Define the port for the server to listen on.
const port = 3000;

// Start the server on port 3000.
app.use(express.static("public"));
app.listen(port, () => {
  console.log(`Webserver started at http://localhost:${port}`);
});
