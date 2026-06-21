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
6. Validate SQL.
7. Execute selected SQL.
8. Maintain query history.
9. Export query results as CSV.

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

## Existing Services

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

exportService.js

* Convert query results to CSV

---

## Current Project Status

Completed Services

✅ geminiService.js

✅ schemaService.js

✅ explanationService.js

✅ impactService.js

✅ executionService.js

✅ historyService.js

✅ exportService.js

Current Status:

* Services are implemented and tested.
* Frontend still uses mockData.js.
* Frontend is not connected to backend APIs.
* History service is not integrated into generation workflow.
* CSV export service is not exposed through API routes.
* SQL validation has not been implemented.

---

## Remaining Work

Sprint 11

Backend Integration

* Connect services through controllers and routes.
* Expose APIs:

  * POST /generate-query
  * POST /explain-query
  * POST /analyze-impact
  * POST /execute-query
  * GET /history
  * POST /export-csv
* Automatically save history after successful SQL generation.

Sprint 12

SQL Validation

* Create validationService.js
* Validate SQL before execution.
* Detect dangerous operations.

Sprint 13

Frontend Integration

* Remove mockData.js dependency.
* Connect React frontend to backend APIs.
* Display live results.

Sprint 14

Dashboard UI

* Modern SaaS-style dashboard.
* TailwindCSS.
* Responsive layout.

---

## Coding Standards

* Use ES Modules
* Use async/await
* No hardcoded secrets
* Descriptive naming
* Modular design
* Create new files whenever possible
* Do not modify unrelated modules

---

## Prompting Instructions

Always:

1. Read README.md
2. Read PROJECT_CONTEXT.md
3. Follow existing architecture
4. Preserve Sprint 1–10 functionality
5. Create new files whenever possible
6. Do not touch unrelated files
7. Return complete file contents
8. Explain file changes
