# 📚 CodeCraftHub Learning Management System (LMS)

A simple REST API built with **Node.js** and **Express.js** that helps developers track their personal learning goals and courses. Course data is stored in a local JSON file, making it an ideal beginner-friendly project for learning REST API development without using a database.

---

## 🚀 Overview

**CodeCraftHub** is a lightweight Learning Management System (LMS) that allows users to manage courses they want to learn. It demonstrates the fundamentals of building RESTful APIs with Node.js and Express while using a JSON file for persistent storage.

---

## ✨ Features

* Create, Read, Update, and Delete (CRUD) courses
* RESTful API design
* JSON file-based data storage (No database required)
* Proper error handling
* Beginner-friendly project structure
* Lightweight and easy to understand

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* JSON File Storage

---

## 📁 Project Structure

```text
codecrafthub/
├── app.js            # Main Express application
├── courses.json      # JSON data storage (auto-created)
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd codecrafthub
```

### 2. Install dependencies

```bash
npm install
```

---

## ▶️ Running the Application

Start the Express server:

```bash
npm start
```

The server will start at:

```
http://localhost:5000
```

---

# 📡 API Endpoints

## 1. Add a Course

**POST** `/api/courses`

### Request Body

```json
{
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "Not Started"
}
```

---

## 2. Get All Courses

**GET** `/api/courses`

Returns all available courses.

---

## 3. Get a Specific Course

**GET** `/api/courses/:id`

Example:

```
GET /api/courses/1
```

Returns the course matching the provided ID.

---

## 4. Update a Course

**PUT** `/api/courses/:id`

Example Request Body:

```json
{
  "status": "In Progress"
}
```

All fields are optional. Only the provided fields will be updated.

---

## 5. Delete a Course

**DELETE** `/api/courses/:id`

Deletes the specified course from storage.

---

# 💾 Data Storage

This project stores all course information inside a local **JSON** file (`courses.json`). No external database is required.

Each course contains:

* Course Name
* Description
* Target Completion Date
* Current Status (Not Started, In Progress, Completed)

---

# 🧪 Testing

You can test the API using:

* Postman
* Thunder Client (VS Code)
* Insomnia
* cURL commands

Example:

```bash
curl http://localhost:5000/api/courses
```

---

# ⚠️ Troubleshooting

### Error: Cannot find module 'express'

Install dependencies:

```bash
npm install
```

---

### Error: Port already in use

Stop the application currently using **port 5000** or change the `PORT` value in `app.js`.

---

# 🎯 Learning Objectives

This project demonstrates:

* Building REST APIs with Express.js
* CRUD Operations
* File handling using Node.js
* JSON data storage
* Route management
* Error handling
* Backend development fundamentals

---

## 📄 License

This project is created for educational purposes and can be freely modified and used for learning.
