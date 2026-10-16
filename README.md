# AI SQL Query Generator

## About the Project

AI SQL Query Generator is a web application that helps users convert simple English instructions into SQL queries. Instead of writing SQL manually, users can describe what data they want, and the application uses an AI model to generate the query.

The project uses the OpenRouter API to access AI models for SQL generation, query explanation, and query analysis. It also supports connecting to a MySQL database, viewing its schema, executing queries, maintaining query history, and exporting results.

The main goal of this project is to make database operations easier and more accessible, especially for users who have limited knowledge of SQL.

## Features

- **AI SQL Generation:** Convert natural language instructions into SQL queries.
- **Query Explanation:** Understand how a generated SQL query works through step-by-step explanations.
- **Database Connection:** Connect to a MySQL database using database connection details.
- **Schema Explorer:** Retrieve table and column information from the connected database to help generate relevant queries.
- **Query Impact Analysis:** Analyze queries to identify possible risks and estimate their impact.
- **Query Execution:** Execute queries against the connected MySQL database.
- **Query History:** Maintain a history of queries and related user prompts.
- **CSV Export:** Export query results in CSV format.
- **Query Optimization:** Provide an API endpoint for query optimization.
- **Authentication and Security:** Includes authentication middleware, CSRF protection, request rate limiting, and SQL safety utilities.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js
- ES Modules

### Database
- MySQL
- mysql2

### AI Integration
- OpenRouter API
- OpenAI JavaScript SDK
- Configurable AI model through environment variables

### Other Tools
- dotenv for environment configuration
- Nodemon for backend development
- UUID for unique identifiers

## How It Works

1. The user enters a requirement in natural language.
2. The React frontend sends a request to the Express backend.
3. The backend uses the configured AI provider to generate the SQL query.
4. Database schema information can be included as context to help the AI generate a query that matches the available tables and columns.
5. The user can request an explanation or impact analysis of the query.
6. The backend provides query execution and result export functionality.
7. Query history can be accessed through the application's API.

## Project Architecture

```text
React Frontend
      |
      v
Express.js Backend
      |
      v
Middleware and API Routes
      |
      v
Controllers
      |
      v
Services
      |
      +---- AI Provider
      |        |
      |        v
      |     OpenRouter API
      |
      +---- MySQL Database
      |
      +---- Query History
      |
      +---- CSV Export
```

## Backend Structure

The backend is organized into separate folders to keep different responsibilities manageable.

- `controllers/` – Handles incoming API requests and responses.
- `routes/` – Defines API endpoints for authentication, queries, execution, schema, history, and other features.
- `services/` – Contains the main application logic for AI operations, database schema retrieval, query execution, history, and exports.
- `providers/` – Defines the AI provider interface and OpenRouter implementation.
- `middleware/` – Contains authentication, CSRF protection, and rate-limiting logic.
- `database/` – Contains database connection and database-related configuration.
- `utils/` – Contains helper functions for AI error handling, SQL safety, host validation, and other utilities.

## Security Features

The project includes several security-related components:

- Authentication middleware for protecting relevant endpoints.
- CSRF protection for state-changing requests.
- Rate limiting to restrict excessive API requests.
- SQL safety utilities to help identify or prevent unsafe query operations.
- Host validation utilities for database connection handling.
- Environment variables for storing API keys and database configuration outside the main source code.

## Running the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the required environment variables in `backend/.env` before starting the application. These include the OpenRouter API key, model name, and MySQL database settings.

## Future Improvements

- Improve SQL validation before query execution.
- Strengthen safeguards for queries that modify or delete data.
- Improve error handling for AI responses and database connections.
- Add more testing for complete frontend-to-backend workflows.
- Continue improving the dashboard and overall user experience.

## Project Information

**Project Name:** AI SQL Query Generator

**Project Type:** B.Tech CSE Major Project

**Purpose:** To simplify SQL generation and database interaction using AI.
