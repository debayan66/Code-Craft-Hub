/**
 * MyLearnTracker - Personal Learning Goal Tracker API
 * A simple REST API to track courses you want to learn
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Configuration
const DATA_FILE = path.join(__dirname, "courses_sample.json");
const PORT = 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Load courses from the JSON file.
 * If file doesn't exist, create an empty one.
 */
function loadCourses() {
  if (!fs.existsSync(DATA_FILE)) {
    // Create empty file if it doesn't exist
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }

  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // If file is corrupted, return empty list
    console.error("Error reading courses file:", error);
    return [];
  }
}

/**
 * Save courses to the JSON file.
 */
function saveCourses(courses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving courses: ${error}`);
    return false;
  }
}

/**
 * Generate the next available ID for a new course.
 */
function getNextId(courses) {
  if (courses.length === 0) {
    return 1;
  }
  return Math.max(...courses.map((course) => course.id)) + 1;
}

/**
 * Find a course by its ID.
 * Returns the course and its index, or {course: null, index: -1} if not found.
 */
function findCourseById(courses, courseId) {
  const index = courses.findIndex((course) => course.id === courseId);
  if (index !== -1) {
    return { course: courses[index], index: index };
  }
  return { course: null, index: -1 };
}

/**
 * Validate that required fields are present in the data.
 * Returns {isValid, errorMessage}
 */
function validateCourseData(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => !(field in data));

  if (missingFields.length > 0) {
    return {
      isValid: false,
      errorMessage: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  // Validate status if provided
  const validStatuses = ["Not Started", "In Progress", "Completed"];
  if ("status" in data && !validStatuses.includes(data.status)) {
    return {
      isValid: false,
      errorMessage: `Status must be one of: ${validStatuses.join(", ")}`,
    };
  }

  return { isValid: true, errorMessage: null };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Home endpoint - provides API information
 */
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MyLearnTracker API!",
    version: "1.0",
    endpoints: {
      "GET /api/courses": "Get all courses",
      "GET /api/courses/<id>": "Get a specific course",
      "POST /api/courses": "Add a new course",
      "PUT /api/courses/<id>": "Update a course",
      "DELETE /api/courses/<id>": "Delete a course",
    },
  });
});

/**
 * GET /api/courses
 * Retrieve all courses
 */
app.get("/api/courses", (req, res) => {
  try {
    const courses = loadCourses();
    res.status(200).json({
      success: true,
      count: courses.length,
      courses: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve courses: ${error.message}`,
    });
  }
});

/**
 * GET /api/courses/<id>
 * Retrieve a specific course by ID
 */
app.get("/api/courses/:id", (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const courses = loadCourses();
    const { course } = findCourseById(courses, courseId);

    if (course) {
      res.status(200).json({
        success: true,
        course: course,
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve course: ${error.message}`,
    });
  }
});

/**
 * POST /api/courses
 * Add a new course
 *
 * Required fields in JSON body:
 * - name: Course name
 * - description: Course description
 * - target_date: Target completion date (YYYY-MM-DD)
 * - status: Course status (Not Started, In Progress, Completed)
 */
app.post("/api/courses", (req, res) => {
  try {
    // Get JSON data from request
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data provided",
      });
    }

    // Validate required fields
    const requiredFields = ["name", "description", "target_date", "status"];
    const { isValid, errorMessage } = validateCourseData(data, requiredFields);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }

    // Load existing courses
    const courses = loadCourses();

    // Create new course
    const newCourse = {
      id: getNextId(courses),
      name: data.name,
      description: data.description,
      target_date: data.target_date,
      status: data.status,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    // Add to courses list
    courses.push(newCourse);

    // Save to file
    if (saveCourses(courses)) {
      res.status(201).json({
        success: true,
        message: "Course added successfully",
        course: newCourse,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to save course",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to add course: ${error.message}`,
    });
  }
});

/**
 * PUT /api/courses/<id>
 * Update an existing course
 *
 * You can update any of these fields:
 * - name
 * - description
 * - target_date
 * - status
 */
app.put("/api/courses/:id", (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    // Get JSON data from request
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data provided",
      });
    }

    // Load existing courses
    const courses = loadCourses();
    const { course, index } = findCourseById(courses, courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`,
      });
    }

    // Validate status if being updated
    if ("status" in data) {
      const { isValid, errorMessage } = validateCourseData(data, []);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: errorMessage,
        });
      }
    }

    // Update course fields
    if ("name" in data) {
      course.name = data.name;
    }
    if ("description" in data) {
      course.description = data.description;
    }
    if ("target_date" in data) {
      course.target_date = data.target_date;
    }
    if ("status" in data) {
      course.status = data.status;
    }

    // Update the course in the list
    courses[index] = course;

    // Save to file
    if (saveCourses(courses)) {
      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: course,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to save changes",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to update course: ${error.message}`,
    });
  }
});

/**
 * DELETE /api/courses/<id>
 * Delete a course
 */
app.delete("/api/courses/:id", (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    // Load existing courses
    const courses = loadCourses();
    const { course, index } = findCourseById(courses, courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`,
      });
    }

    // Remove the course
    const deletedCourse = courses.splice(index, 1)[0];

    // Save to file
    if (saveCourses(courses)) {
      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        deleted_course: deletedCourse,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to save changes",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to delete course: ${error.message}`,
    });
  }
});

// ============================================================================
// BONUS ENDPOINTS (Optional enhancements)
// ============================================================================

/**
 * GET /api/courses/stats
 * Get statistics about your courses
 */
app.get("/api/courses/stats", (req, res) => {
  try {
    const courses = loadCourses();

    const stats = {
      total_courses: courses.length,
      not_started: courses.filter((c) => c.status === "Not Started").length,
      in_progress: courses.filter((c) => c.status === "In Progress").length,
      completed: courses.filter((c) => c.status === "Completed").length,
    };

    res.status(200).json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to get statistics: ${error.message}`,
    });
  }
});

/**
 * GET /api/courses/search?q=searchterm
 * Search courses by name or description
 */
app.get("/api/courses/search", (req, res) => {
  try {
    const searchQuery = (req.query.q || "").toLowerCase();

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required',
      });
    }

    const courses = loadCourses();

    // Filter courses that match the search query
    const results = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery) ||
        course.description.toLowerCase().includes(searchQuery)
    );

    res.status(200).json({
      success: true,
      count: results.length,
      courses: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to search courses: ${error.message}`,
    });
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Handle 404 errors
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

/**
 * Handle 500 errors
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// ============================================================================
// RUN THE APPLICATION
// ============================================================================

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("MyLearnTracker API is starting...");
  console.log("=".repeat(60));
  console.log(`Data will be stored in: ${path.resolve(DATA_FILE)}`);
  console.log(`API will be available at: http://localhost:${PORT}`);
  console.log("=".repeat(60));
  console.log("\nPress CTRL+C to stop the server\n");
});



//This code includes:

//All CRUD operations
//Proper error handling
//Input validation
//Automatic JSON file creation
//Helpful comments for beginners