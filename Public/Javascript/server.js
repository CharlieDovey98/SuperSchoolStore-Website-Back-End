// Webserver using express.js and Node.js
// Use: 'npm start' to start the script which runs the server.
// Use: ctrl ^c to stop the server.

const express = require("express");
const path = require("path");
const http = require("http");
const morgan = require("morgan");
const db = require("./mongoDB");  // Make sure this is correctly configured in mongoDB.js

// Calls the express function to start a new Express application
const app = express();

// Middleware to log requests
app.use(morgan("dev"));

// Serve static files from the 'Public' directory
app.use(express.static(path.join(__dirname, "Public")));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to log additional request details
app.use((request, response, next) => {
  console.log("Request coming in " + request.method + " to " + request.url);
  console.log("Request IP: " + request.ip);
  console.log("Request date: " + new Date());
  next();
});

// Route to index.html. Need to seperate the repos and alter the code.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// MongoDB route to fetch all documents in a collection.
app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/collections/:collectionName", async (req, res, next) => {
  try {
    const results = await req.collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Error handling middleware.
app.use((err, req, res, next) => {
  console.error("Error encountered:", err);
  res.status(500).json({ error: "An internal error occurred" });
});

// Define the port for the server to listen on.
const port = 3000;

// Start the server on port 3000.
http.createServer(app).listen(port, () => {
  console.log(`Werbserver started at http://localhost:${port}`);
});
