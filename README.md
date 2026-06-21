# AI SQL Query Generator

## Overview

AI SQL Query Generator is a web application that converts natural language requirements into SQL queries.

The system uses Gemini AI to understand user intent, generate SQL statements, explain generated queries, estimate query impact, and execute selected queries against a database.

---

## Features

### SQL Generation

Convert natural language into SQL.

Example:

Input:
Show all employees whose salary is greater than 50000.

Output:

SELECT *
FROM Employee
WHERE Salary > 50000;

### Query Explanation

Explain generated SQL in simple language.

### Database Schema Understanding

Read tables and columns from connected database.

### Query Impact Analysis

Estimate:

* Rows returned
* Rows affected
* Potential risks

### Query Validation

Validate generated SQL before execution.

### Query Execution

Execute user-selected SQL queries.

### Query History

Store previous prompts and generated SQL.

### CSV Export

Export query results.

---

## Tech Stack

Frontend:

* React
* Vite
* TailwindCSS

Backend:

* Node.js
* Express.js

Database:

* MySQL

AI:

* Gemini API
* LangChain

---

## Architecture

User
↓
Frontend
↓
Backend API
↓
Services Layer
↓
Database + Gemini

---

## Development Approach

Build feature-by-feature.

Every feature must:

* Be tested independently.
* Be committed separately.
* Not modify unrelated modules.

---

## Folder Structure

frontend/
backend/

backend/src

routes/
controllers/
services/
database/

frontend/src

components/
pages/
services/

---

## Setup

Frontend:

npm install
npm run dev

Backend:

npm install
npm run dev

Database:

MySQL

---

## Authors

B.Tech CSE Project
AI SQL Query Generator
