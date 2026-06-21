# PROJECT_CONTEXT

IMPORTANT

Read this file before generating code.

---

## Objective

Build an AI-powered SQL Query Generator.

The system must:

1. Accept natural language prompts.
2. Generate SQL.
3. Explain SQL.
4. Show tables involved.
5. Estimate impact.
6. Execute selected SQL.
7. Maintain query history.

---

## Golden Rules

1. Do not rewrite working features.
2. Create new files whenever possible.
3. Modify only files directly related to the requested task.
4. Follow existing folder structure.
5. Keep services independent.
6. Use clean architecture principles.
7. Use async/await.

---

## Backend Architecture

routes
↓
controllers
↓
services
↓
database

Controllers must never contain business logic.

Business logic belongs inside services.

---

## Service Responsibilities

geminiService.js

* Generate SQL
* Call Gemini API

schemaService.js

* Read database schema

explanationService.js

* Explain SQL

impactService.js

* Estimate affected rows

executionService.js

* Execute SQL

historyService.js

* Store history

---

## Frontend Architecture

pages

* High-level screens

components

* Reusable UI

services

* API calls

---

## Environment Variables

GEMINI_API_KEY

DB_HOST

DB_PORT

DB_USER

DB_PASSWORD

DB_NAME

---

## Coding Standards

* Use ES Modules
* Use async/await
* No hardcoded secrets
* Descriptive naming
* Modular design

---

## Sprint Tracker

Sprint 1
[ ] Project Setup

Sprint 2
[ ] Frontend UI

Sprint 3
[ ] Backend API

Sprint 4
[ ] Gemini Integration

Sprint 5
[ ] Schema Reader

Sprint 6
[ ] Query Explanation

Sprint 7
[ ] Impact Analysis

Sprint 8
[ ] Query Execution

Sprint 9
[ ] Query History

Sprint 10
[ ] CSV Export

---

## Prompting Instructions

Always:

1. Read README.md
2. Read PROJECT_CONTEXT.md
3. Follow existing architecture
4. Create new files whenever possible
5. Do not touch unrelated files
6. Return complete file contents
7. Explain file changes
