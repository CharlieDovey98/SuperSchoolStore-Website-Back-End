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
const { db } = require("./mongoDB"); // Importing from mongoDB.js file.

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

// Allow CORS for GitHub Pages.
const corsOptions = {
  origin: ['https://charliedovey98.github.io'], // Allow frontend origins.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],    // Allow HTTP methods.
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers.
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Added to handle preflight requests.

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

// Route parameter to validate and preprocess the parameter element :lessonId.
app.param("lessonId", (request, response, next, lessonId) => {
  (async () => {
    try {
      const numericId = parseInt(lessonId, 10); // Parse the lessonId as a base-10 number.
      if (isNaN(numericId)) { // Check if the numericId is Not-A-Number.
        return response.status(400).json({ error: "Invalid lesson ID" });
      }

      // Check if the ID exists in the database.
      const exists = await db.collection("lessons").findOne({ id: numericId });
      if (!exists) {
        return response.status(404).json({ error: "Lesson ID not found in database" });
      }

      request.lessonId = numericId; // Store the validated ID in request object.
      next();
    } catch (error) {
      next(error); // Pass any errors to Express error handling middleware.
    }
  })();
});

// Get route to attain a single document in the lessons collection of the database.
app.get('/collections/:collectionName/:lessonId', async (request, response, next) => {
  try {
    const result = await request.collection.findOne({ id: request.lessonId }); // Query by `id`, not '_id'.
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



// Route parameter to validate and preprocess the parameter element :lessonField.
app.param("lessonField", (request, response, next, lessonField) => {
  const validFields = ["id","title","subject","location","description","courseLength","price","spacesAvailable","rating","image",];
  // Guard statement to validate the input. Only the above strings are valid inputs.
  if (!validFields.includes(lessonField)) {
    return response.status(400).json({ error: `Invalid lesson field entered: ${lessonField}` });
  }
  request.lessonField = lessonField; // Store the validated lessonField in request object.
  next();
});

// Route parameter to validate and preprocess the parameter element :operation.
app.param("operation", (request, response, next, operation) => {
  const validOperations = ["increment", "decrement", "set"];
  
  // Guard statement to validate the input.
  if (!validOperations.includes(operation)) {
    return response.status(400).json({ error: `Invalid operation entered: ${operation}` });
  }

  request.operation = operation; // Store the validated operation in the request object.
  next();
});

// Put route to update any Lesson attribute.
app.put("/collections/lessons/:lessonId/:lessonField/:operation", async (request, response, next) => {
  try {
    const { lessonId, lessonField, operation } = request; // Extract parameters.
    const { value } = request.body; // Extract the value from the request body.

    // Initialize the update query, which willbe updated based on the operation.
    let updateQuery;
    const lesson = await db.collection("lessons").findOne({ id: lessonId });
    // Validate value based on numerical field types.
    if (
      ["spacesAvailable", "price", "rating", "courseLength", "id"].includes(lessonField)) {
      if (typeof value !== "number") {
        return response.status(400).json({error: `Invalid value type for numeric field: ${lessonField}`});
      }
      const currentFieldValue = lesson[lessonField]; // Dynamically access the current field value.
      // Handle numeric operations on Lesson attributes.
      if (operation === "increment") {
        updateQuery = { $inc: { [lessonField]: value } }; // Increment the field by 'value'.
      } else if (operation === "decrement") {
        if (currentFieldValue - value < 0) {
          return response.status(400).json({ error: `${lessonField} cannot decrement below 0` });
        }
        updateQuery = { $inc: { [lessonField]: -value } }; // Decrement the field by 'value'.
      } else if (operation === "set") {
        updateQuery = { $set: { [lessonField]: value } }; // Set the field to the specified 'value'.
      } else {
        return response
          .status(400)
          .json({ error: "Invalid operation for a numeric field" });
      }
    } else if (
      ["title", "subject", "location", "description", "image"].includes(
        lessonField
      )
    ) {
      // Handle string operations on Lesson attributes.
      if (typeof value !== "string") {
        return response.status(400).json({error: `Invalid value type for string field: ${lessonField}`});
      }

      if (operation === "set") {
        updateQuery = { $set: { [lessonField]: value } }; // Set the field to the specified 'value'.
      } else {
        return response.status(400).json({error: `'set' is the only allowed operation for the string field: ${lessonField}`});
      }
    }

    // Complete the update operation.
    const result = await db.collection("lessons").updateOne(
      { id: lessonId }, // Match the document by lesson ID.
      updateQuery // Apply the dynamic update query.
    );

    response.json({ message: `Lesson ${lessonField} updated successfully`, result });
  } catch (error) {
    next(error);
  }
});

// Get route for testing middleware error logging.
app.get("/testError500", (request, response) => {
  throw new Error("Test Error 500.");
});

// Middleware for checking if an image exists in the backend images folder and, handling not finding the image requested.
app.use('/images/:imageName', (request, response) => {
  const errorMessage = new Error(`Error encountered, Image ${request.params.imageName} not found..`);
  logError(errorMessage, request);
  return response.status(403).json({error: `Image ${request.params.imageName} not found, check server logs for more details.`,});
});

// Middleware for handling 500, route execution errors (test with get/ testError500).
app.use((error, request, response, next) => {
  logError(error, request);
  response.status(500).json({ error: "An internal error occurred, check server logs for indepth error reporting." });
});

// Middleware for requests to incorrect routes, handling 404 errors.
app.use((request, response) => {
  const errorMessage = new Error("Error status 404 encountered, Route not found.");
  logError(errorMessage, request);
  response.status(404).json({ error: "Route not found, check server logs for indepth error reporting." });
});

// Define the port for the server to listen on.
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`App started on port: ${port}`);
});