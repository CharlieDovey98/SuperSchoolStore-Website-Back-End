// Webserver using express.js and Node.js
// Use: 'npm start' to start the script which runs the server.
// Use: ctrl ^c to stop the server.

// Importing the needed packages.
const express = require("express");
const path = require("path");
//const http = require("http");
const cors = require('cors');
const morgan = require("morgan");
// Importing from mongoDB.js file.
const { db, ObjectId } = require("./mongoDB"); 

// Call the express function to start a new Express application.
const app = express();

// Middleware to log HTTP requests.
app.use(morgan("dev"));

// Middleware to parse JSON requests.
app.use(express.json());

// Allow CORS for GitHub Pages.
const corsOptions = {
  origin: ['https://charliedovey98.github.io'], // Allow frontend origin.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],    // Allow HTTP methods.
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers.
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Added to handle preflight requests.

// Middleware to log additional request details.
app.use((request, response, next) => {
  console.log("Request coming in: " + request.method + " to " + request.url + "\nRequest IP: " + request.ip + "\nRequest date: " + new Date());
  next();
});

// Serve static files (CSS, JS, Images) from the "BackEnd" folder.
app.use('/static', express.static(path.join(__dirname, 'BackEnd')));

// Error handling middleware.
app.use((error, request, response, next) => {
  console.error("Error encountered:", error);
  response.status(500).json({ error: "An internal error occurred" });
});

// Route parameter to validate and preprocess the parameter element :collectionName.
app.param("collectionName", (request, response, next, collectionName) => {
  // Guard statement to validate the input. Only the below array elements are valid inputs.
  const validCollectionName = ["lessons", "purchases"];
  if (!validCollectionName.includes(collectionName)) { // If invalid input, return an error.
    return response.status(400).json({ error: `Invalid collection name: ${collectionName}` });
  }
  request.collection = db.collection(collectionName);
  return next();
});

// Route parameter to validate and preprocess the parameter element :sortAspect.
app.param("selectedSortAspect", (request, response, next, selectedSortAspect) => {
  // Guard statement to validate the input. Only the below array elements are valid inputs.
  const validSortAspects = ["subject", "location", "price", "courseLength", "spacesAvailable"];
  if (!validSortAspects.includes(selectedSortAspect)) {
    return response.status(400).json({ error: `Invalid sort aspect: ${selectedSortAspect}` });
  }
  request.sortAspect = selectedSortAspect; // Store the validated value in the request object.
  next();
});

// Route parameter to validate and preprocess the parameter element :sortAscendingDescending.
app.param("sortAscendingDescending",(request, response, next, sortAscendingDescending) => {
    // Guard statement to validate the input. Only ascending and descending are valid inputs.
    if (!["ascending", "descending"].includes(sortAscendingDescending)) {
      return response.status(400).json({ error: `Invalid sort direction: ${sortAscendingDescending}` });
    }
      // The ternary operator assigns a sorting direction integer to the request element, based on the sortAscendingDescending value. If descending -1, or 1 for ascending.
      request.sortDirection = sortAscendingDescending === "descending" ? -1 : 1;
      next();
  }
);

// Get route to attain the data stored in a collection, using the parameter :collectionName.
app.get("/collections/:collectionName", async (request, response, next) => {
  try {
    const results = await request.collection.find({}).toArray();
    response.json(results); // Respond with the result in JSON format.
  } catch (error) {
    next(error);
  }
});

// Get route to attain the lessons sorted by parameters :selectedSortAspect and direction :sortAscendingDescending.
app.get("/collections/:collectionName/:selectedSortAspect/:sortAscendingDescending",
  async (request, response, next) => {
    try { // Try catch to find the required collection, sort the results using the selected sorting aspect and the sorting direction.
      const results = await request.collection.find({}).sort({ [request.sortAspect]: request.sortDirection }).toArray();
      response.json(results);
    } catch (error) {
      next(error);
    }
  }
);

// Get route to attain a single document in the lessons collection of the database.
app.get('/collections/:collectionName/:id', async (request, response, next) => {
  try {
    const result = await request.collection.findOne({ _id: new ObjectId(request.params.id) });
    if (!result) {
      return response.status(404).json({ error: 'Document not found' });
    }
    response.json(result);
  } catch (error) {
    next(error); 
  }
});

// POST route to add a new purchase to the purchases collection.
app.post("/collections/purchases", async (request, response, next) => {
  try {
    const purchase = request.body; // Get purchase details from the request body.
    if (!purchase) {
      return response.status(400).json({ error: "Purchase data is missing" });
    }
    // Insert the purchase into the purchases collection.
    const result = await db.collection("purchases").insertOne(purchase);
    response.json({ message: "Purchase added successfully", result });
  } catch (error) {
    next(error);
  }
});

// Define the port for the server to listen on.
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`App started on port: ${port}`);
});