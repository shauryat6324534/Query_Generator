# AI SQL Query Generator

## Overview

AI SQL Query Generator is a web application that converts natural language requirements into SQL queries.

The system uses Gemini AI to understand user intent, generate SQL statements, explain generated queries, estimate query impact, execute selected queries, maintain history, and export results.

---

## Current Status

### Completed

* SQL Generation
* Query Explanation
* Database Schema Reader
* Query Impact Analysis
* Query Execution Service
* Query History Service
* CSV Export Service

### In Progress

* Backend API Integration
* SQL Validation
* Frontend ↔ Backend Integration
* Dashboard UI Redesign

---

## Features

### SQL Generation

Convert natural language into SQL.

### Query Explanation

Explain generated SQL in simple language.

### Database Schema Understanding

Read tables and columns from the connected database.

### Query Impact Analysis

Estimate:

* Rows returned
* Rows affected
* Potential risks

### Query Execution

Execute generated SQL against MySQL.

### Query History

Store prompts and generated SQL.

### CSV Export

Convert query results into CSV format.

### Planned

#### SQL Validation

Validate generated SQL before execution.

#### Frontend API Integration

Connect React frontend with backend services.

#### Dashboard UI

Modern SaaS-style responsive interface.

---

## Architecture

User
↓
Frontend
↓
Backend API
↓
Controllers
↓
Services
↓
Database + Gemini

---

## Backend Services

Implemented:

* geminiService.js
* schemaService.js
* explanationService.js
* impactService.js
* executionService.js
* historyService.js
* exportService.js

Planned:

* validationService.js

---

## Sprint Status

Sprint 1  ✅ Project Setup

Sprint 2  ✅ Frontend UI Prototype

Sprint 3  ✅ Backend API Foundation

Sprint 4  ✅ Gemini Integration

Sprint 5  ✅ Schema Reader

Sprint 6  ✅ Query Explanation

Sprint 7  ✅ Impact Analysis

Sprint 8  ✅ Query Execution

Sprint 9  ✅ Query History Service

Sprint 10 ✅ CSV Export Service

Sprint 11 ✅ Backend Integration

Sprint 12 ⏳ SQL Validation

Sprint 13 ⏳ Frontend Integration

Sprint 14 ⏳ Dashboard UI

---

## Tech Stack

Frontend

* React
* Vite
* TailwindCSS

Backend

* Node.js
* Express.js

Database

* MySQL

AI

* Gemini API

---

## Authors

B.Tech CSE Major Project

AI SQL Query Generator
