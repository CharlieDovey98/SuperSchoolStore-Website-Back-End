// Webserver using express.js and Node.js
// Use: 'npm start' to start the script which runs the server.
// Use: ctrl ^c to stop the server.

// Importing the needed packages.
const express = require("express");
const path = require("path");
//const http = require("http");
const cors = require('cors');
const fs = require("fs"); // Require the `fs` file system module for checking file existence when working with the websites images.
const morgan = require("morgan");
const Routes = require("./routes"); // Import the routes file

// Call the express function to start a new Express application.
const app = express();

// A writable stream for logging to a file, used in the middleware for indepth error logging.
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
const logError = (error, request) => {
  const errorMessage = `[ERROR] ${request.method} ${request.originalUrl} at ${request.ip} Message: ${error.message || "Unknown Error"} dated: ${new Date()}`;
  console.error(errorMessage);
  logStream.write(`${errorMessage}\n`);
};

// Middleware to parse JSON requests.
app.use(express.json());

// Middleware to serve static image files from the "images" folder.
app.use('/images', express.static(path.join(__dirname, "images")));

// Middleware to log HTTP requests.
app.use(morgan('New Request :method :url Status(:status) Result: :res[content-length] bytes in: :response-time ms | IP: :remote-addr'));

// Set Cors options. 
const corsOptions = {
  origin: ['https://charliedovey98.github.io', 'http://127.0.0.1:3001'], // Allow frontend testing and production origins.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],    // Allow HTTP methods.
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers.
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Added to handle preflight requests, e.g. PUT, DELETE.

// Use the routes from the separate file.
app.use(Routes);

// Middleware for checking if an image exists in the backend images folder and, handling not finding the image requested.
app.use('/images/:imageName', (request, response) => {
  const errorMessage = new Error(`Error encountered, Image ${request.params.imageName} not found.`);
  logError(errorMessage, request);
  return response.status(403).json({error: `Image ${request.params.imageName} not found, check server logs for more details.`,});
});

// Middleware for handling more generic errors.
app.use((error, request, response, next) => {
  // Check the error status and handle accordingly.
  if (error.status === 400) {// Handle all status 400 Errors, Bad request Errors.
    logError(error, request); 
    return response.status(400).json({ error: error.message || "Bad Request" });
  }
  if (error.status === 404) { // Handle all status 404, incorrect Route Errors.
    const errorMessage = new Error("Error status 404 encountered, Route not found.");
    logError(errorMessage, request);
    response.status(404).json({ error: "Route not found, check server logs for indepth error reporting." });
  }
  if (error.status === 500) { // Handle all status 500 Internal Server Errors. (test with get/ testError500).
    logError(error, request);
    return response.status(500).json({ error: "Route not found, check server logs for indepth error reporting." });
  }

  logError(error, request); // Catch and handle any other errors.
  response.status(error.status || 500).json({ error: "An internal error occurred, check server logs for indepth error reporting." });
});

// Define the port for the server to listen on.
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`App started on port: ${port}`);
});