// User Routes for SuperSchoolStore S3 website, containing parameters and methods for routes: GET POST etc.

// Import the neccessary modules.
const express = require("express");
const { db, ObjectId } = require("./mongoDB"); // Importing from mongoDB.js file.
const router = express.Router();

// Route parameter to validate and preprocess the parameter element :collectionName.
router.param("collectionName", (request, response, next, collectionName) => {
  // Guard statement to validate the input. Only the below array elements are valid inputs.
  const validCollectionName = ["lessons", "purchases"];
  if (!validCollectionName.includes(collectionName)) {
    // If invalid input, return an error.
    const error = new Error(`Invalid collection name: ${collectionName}`);
    error.status = 400;
    return next(error);
  }
  request.collection = db.collection(collectionName);
  return next();
});

// Route parameter to validate and preprocess the parameter element :sortAspect.
router.param("selectedSortAspect",(request, response, next, selectedSortAspect) => {
    // Guard statement to validate the input. Only the below array elements are valid inputs.
    const validSortAspects = [
      "subject",
      "location",
      "price",
      "courseLength",
      "spacesAvailable",
    ];
    if (!validSortAspects.includes(selectedSortAspect)) {
        const error = new Error(`Invalid sort aspect: ${selectedSortAspect}`);
        error.status = 400;
        return next(error);
    }
    request.sortAspect = selectedSortAspect; // Store the validated value in the request object.
    next();
  }
);

// Route parameter to validate and preprocess the parameter element :sortAscendingDescending.
router.param("sortAscendingDescending",(request, response, next, sortAscendingDescending) => {
    // Guard statement to validate the input. Only ascending and descending are valid inputs.
    if (!["ascending", "descending"].includes(sortAscendingDescending)) {
      const error = new Error(`Invalid sort direction: ${sortAscendingDescending}`);
      error.status = 400;
      return next(error);
    }
    // The ternary operator assigns a sorting direction integer to the request element, based on the sortAscendingDescending value. If descending -1, or 1 for ascending.
    request.sortDirection = sortAscendingDescending === "descending" ? -1 : 1;
    next();
  }
);

// Get route to attain the data stored in a collection, using the parameter :collectionName.
router.get("/collections/:collectionName", async (request, response, next) => {
  try {
    const results = await request.collection.find({}).toArray();
    response.json(results); // Respond with the result in JSON format.
  } catch (error) {
    next(error);
  }
});

// Get route to attain the lessons sorted by parameters :selectedSortAspect and direction :sortAscendingDescending.
router.get("/collections/:collectionName/:selectedSortAspect/:sortAscendingDescending",async (request, response, next) => {
    try {
      // Try catch to find the required collection, sort the results using the selected sorting aspect and the sorting direction.
      const results = await request.collection.find({}).sort({ [request.sortAspect]: request.sortDirection }).toArray();
      response.json(results);
    } catch (error) {
      next(error);
    }
  }
);

// Route parameter to ensure the keyword search query is not empty, and and to preprocess it.
router.param("query", (request, response, next, query) => {
  if (!query || query.trim() === "") {
    const error = new Error("A Search query is required.");
    error.status = 400;
    return next(error); // Pass the error to the error-handling middleware.
  }
  // Preprocessing the query, trimming and converting it to lowercase.
  request.params.query = query.trim().toLowerCase();
  next();
});

// Get route to search through the database to find a keyword search query.
router.get("/search/:query", async (request, response, next) => {
  try {
    const { query } = request.params; // Get the search query from the URL.

    const regex = new RegExp(query, "i"); // Define the case insensitive regex search pattern.

    // Search across all Lesson fields other than the unique ObjectId and id fields.
    const results = await db.collection("lessons").find({
        $or: [
          { title: regex },
          { subject: regex },
          { location: regex },
          { description: regex },
          { courseLength: parseInt(query) || null }, // ParseInt to match exact number for fields.
          { price: parseFloat(query) || null },
          { spacesAvailable: parseInt(query) || null },
          { rating: parseFloat(query) || null },
        ],
      }).toArray();

    response.json(results); // Return the search results on the fields above.
  } catch (error) {
    next(error); // Pass the error to the middleware.
  }
});

// Route parameter to validate and preprocess the parameter element :lessonId.
router.param("lessonId", (request, response, next, lessonId) => {(async () => {
    try {
      const numericId = parseInt(lessonId, 10); // Parse the lessonId as a base-10 number.
      if (isNaN(numericId)) {
        // Check if the numericId is Not-A-Number.
        const error = new Error("Invalid lesson ID" );
        error.status = 400;
        return next(error);
      }

      // Check if the ID exists in the database.
      const exists = await db.collection("lessons").findOne({ id: numericId });
      if (!exists) {
        const error = new Error("Lesson ID not found in database");
        error.status = 404;
        return next(error);
      }

      request.lessonId = numericId; // Store the validated ID in request object.
      next();
    } catch (error) {
      next(error); // Pass any errors to Express error handling middleware.
    }
  })();
});

// Get route to attain a single document in the lessons collection of the database.
router.get("/collections/:collectionName/:lessonId",async (request, response, next) => {
    try {
      const result = await request.collection.findOne({ id: request.lessonId }); // Query by `id`, not '_id'.
      response.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST route to add a new purchase to the purchases collection.
router.post("/collections/purchases", async (request, response, next) => {
  try {
    const purchase = request.body; // Get purchase details from the request body.

    // Guard statement to validate the input. Required fields to make a purchase are below.
    const requiredFields = ["forename", "surname", "phoneNumber", "lessons"];
    const missingFields = []; // Array to store missing fields within the fetch.
    // For loop to check if all required fields are present.
    for (const field of requiredFields) {
      if (!purchase[field]) {
        missingFields.push(field); // Add missing field to the array.
      }
    }

    // If there are missing fields, return an error.
    if (missingFields.length > 0) {
      const error = new Error(`The following fields are required: ${missingFields.join(", ")}`);
      error.status = 400;
      return next(error);
    }
    // Insert the purchase into the purchases collection.
    const result = await db.collection("purchases").insertOne(purchase);
    response.json({ message: "Purchase added successfully", result });
  } catch (error) {
    next(error);
  }
});

// Route parameter to validate and preprocess the parameter element :lessonField.
router.param("lessonField", (request, response, next, lessonField) => {
  const validFields = [
    "id",
    "title",
    "subject",
    "location",
    "description",
    "courseLength",
    "price",
    "spacesAvailable",
    "rating",
    "image",
  ];
  // Guard statement to validate the input. Only the above strings are valid inputs.
  if (!validFields.includes(lessonField)) {
    const error = new Error(`Invalid lesson field entered: ${lessonField}`);
    error.status = 400;
    return next(error);
  }
  request.lessonField = lessonField; // Store the validated lessonField in request object.
  next();
});

// Route parameter to validate and preprocess the parameter element :operation.
router.param("operation", (request, response, next, operation) => {
  const validOperations = ["increment", "decrement", "set"];

  // Guard statement to validate the input.
  if (!validOperations.includes(operation)) {
    const error = new Error(`Invalid operation entered: ${operation}` );
    error.status = 400;
    return next(error);
  }

  request.operation = operation; // Store the validated operation in the request object.
  next();
});

// Put route to update any Lesson attribute.
router.put("/collections/lessons/:lessonId/:lessonField/:operation",async (request, response, next) => {
    try {
      const { lessonId, lessonField, operation } = request; // Extract parameters.
      const { value } = request.body; // Extract the value from the request body.

      // Initialize the update query, which willbe updated based on the operation.
      let updateQuery;
      const lesson = await db.collection("lessons").findOne({ id: lessonId });
      // Validate value based on numerical field types.
      if (["spacesAvailable", "price", "rating", "courseLength", "id"].includes(lessonField)) {
        if (typeof value !== "number") {
          const error = new Error(`Invalid value type for numeric field: ${lessonField}`);
          error.status = 400;
          return next(error);
        }
        const currentFieldValue = lesson[lessonField]; // Dynamically access the current field value.
        // Handle numeric operations on Lesson attributes.
        if (operation === "increment") {
          updateQuery = { $inc: { [lessonField]: value } }; // Increment the field by 'value'.
        } else if (operation === "decrement") {
          if (currentFieldValue - value < 0) {
            const error = new Error(`${lessonField} cannot decrement below 0`);
            error.status = 400;
            return next(error);
          }
          updateQuery = { $inc: { [lessonField]: -value } }; // Decrement the field by 'value'.
        } else if (operation === "set") {
          updateQuery = { $set: { [lessonField]: value } }; // Set the field to the specified 'value'.
        } else {
          const error = new Error("Invalid operation for a numeric field" );
          error.status = 400;
          return next(error);
        }
      } else if (["title", "subject", "location", "description", "image"].includes(lessonField)) {
        // Handle string operations on Lesson attributes.
        if (typeof value !== "string") {
          const error = new Error(`Invalid value type for string field: ${lessonField}`);
          error.status = 400;
          return next(error);
        }

        if (operation === "set") {
          updateQuery = { $set: { [lessonField]: value } }; // Set the field to the specified 'value'.
        } else {
          const error = new Error(`'set' is the only allowed operation for the string field: ${lessonField}`);
          error.status = 400;
          return next(error);
        }
      }

      // Complete the update operation.
      const result = await db.collection("lessons").updateOne(
        { id: lessonId }, // Match the document by lesson ID.
        updateQuery // Apply the dynamic update query.
      );

      response.json({message: `Lesson ${lessonField} updated successfully`,result,});
    } catch (error) {
      next(error);
    }
  }
);

// Route parameter to validate the MongoDB ObjectId.
router.param("_id", (request, response, next, id) => {
    // Validate if the id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      const error = new Error("Invalid ObjectId format.");
      error.status = 400;
      return next(error);
    }
  
    // Attach the ObjectId to the request object.
    request.objectId = new ObjectId(id);
    next();
  });

// DELETE route to delete a lesson by its mongodb objectId _id.
router.delete("/collections/lessons/:_id", async (request, response, next) => {
  try {
    const objectId = request.objectId; // Get the _id from the request param.

    // Delete the verified lesson from the collection.
    const result = await db.collection("lessons").deleteOne({ _id: objectId });

    // Check if a document was deleted.
    if (result.deletedCount === 0) {
      const error = new Error("Lesson not found.");
      error.status = 404;
      return next(error);
    }

    response.status(200).json({ message: "Lesson deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// POST route to add a new lesson to the lessons collection
router.post('/collections/lessons/newPost', async (request, response, next) => {
    try {
        const lesson = request.body; // Get the lesson data from the request body

        // Validate that all required fields are present
        const requiredFields = ['id', 'title', 'subject', 'location', 'description', 'courseLength', 'price', 'spacesAvailable', 'rating', 'image'];
        const missingFields = requiredFields.filter(field => !lesson[field]);

        if (missingFields.length > 0) {
            const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
            error.status = 400;
            return next(error);
        }

        // Insert the lesson into the lessons collection.
        const result = await db.collection('lessons').insertOne(lesson);
        // Return the ID of the newly created lesson
        response.status(201).json({message: "Lesson added successfully.", lessonId: result.insertedId,});
    } catch (error) {
        next(error);
    }
});

// Get route for testing middleware error logging.
router.get("/testError500", (request, response, next) => {
  const error = new Error("Internal server Error test, Error status 500.");
  error.status = 500;
  next(error);
});

module.exports = router;