export const QUICK_EXAMPLES = [
  {
    id: "salary",
    label: "Employee Salaries",
    prompt: "Show all employees whose salary is greater than 50000",
  },
  {
    id: "sales",
    label: "Product Sales",
    prompt: "Get the total sales for each product in the last 30 days",
  },
  {
    id: "inactive",
    label: "Inactive Customers",
    prompt: "Find customers who registered in 2025 but haven't placed any orders",
  },
  {
    id: "logs",
    label: "Prune Old Logs",
    prompt: "Delete all logs older than 6 months",
  },
  {
    id: "departments",
    label: "Top Departments",
    prompt: "Calculate the average department rating, group by department name, having average rating > 4.5",
  }
];

const mockResponses = {
  salary: {
    sql: `SELECT *
FROM employees
WHERE salary > 50000;`,
    explanation: [
      "Selects all columns (`*`) from the `employees` table.",
      "Filters rows to include only those where the value in the `salary` column exceeds `50000`."
    ],
    impact: {
      riskLevel: "LOW",
      rowsAffected: 0,
      rowsReturned: 120,
      tables: ["employees"],
      warnings: ["None. This is a read-only query and uses indexed filter conditions."]
    }
  },
  sales: {
    sql: `SELECT 
  p.product_id,
  p.product_name,
  SUM(o.quantity * o.unit_price) AS total_sales
FROM products p
JOIN order_items o ON p.product_id = o.product_id
JOIN orders ord ON o.order_id = ord.order_id
WHERE ord.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY p.product_id, p.product_name
ORDER BY total_sales DESC;`,
    explanation: [
      "Joins the `products`, `order_items`, and `orders` tables to link products with their ordered quantities and dates.",
      "Filters for orders placed within the last 30 days using `DATE_SUB(CURDATE(), INTERVAL 30 DAY)`.",
      "Groups results by product ID and product name to aggregate sales.",
      "Calculates total sales as the sum of product of quantity and unit price for each product.",
      "Sorts products in descending order of total sales."
    ],
    impact: {
      riskLevel: "MEDIUM",
      rowsAffected: 0,
      rowsReturned: 45,
      tables: ["products", "order_items", "orders"],
      warnings: ["Scanning orders table may take time if no index exists on order_date. Consider adding a composite index on (order_date) to speed up execution."]
    }
  },
  inactive: {
    sql: `SELECT 
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email,
  c.registration_date
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE YEAR(c.registration_date) = 2025
  AND o.order_id IS NULL;`,
    explanation: [
      "Selects customer details from the `customers` table.",
      "Performs a `LEFT JOIN` with the `orders` table to check for associated orders.",
      "Filters for customers registered in the year 2025.",
      "Checks `o.order_id IS NULL` to filter for customers who do not have any matching records in the `orders` table (meaning they have never ordered)."
    ],
    impact: {
      riskLevel: "LOW",
      rowsAffected: 0,
      rowsReturned: 350,
      tables: ["customers", "orders"],
      warnings: ["Using functions like YEAR() on indexed columns prevents the database from utilizing the index. Consider using range filtering (registration_date BETWEEN '2025-01-01' AND '2025-12-31') instead."]
    }
  },
  logs: {
    sql: `DELETE FROM system_logs
WHERE log_date < DATE_SUB(NOW(), INTERVAL 6 MONTH);`,
    explanation: [
      "Performs a delete operation targeting the `system_logs` table.",
      "Filters rows where the `log_date` is strictly older than 6 months from the current timestamp."
    ],
    impact: {
      riskLevel: "HIGH",
      rowsAffected: 45000,
      rowsReturned: 0,
      tables: ["system_logs"],
      warnings: [
        "This is a destructive action! Deleting 45k rows at once can lock the system_logs table, resulting in database degradation.",
        "We recommend deleting in batches (e.g. using LIMIT 1000 in a loop) or during off-peak hours."
      ]
    }
  },
  departments: {
    sql: `SELECT 
  d.department_name,
  AVG(r.rating_score) AS average_rating,
  COUNT(r.review_id) AS total_reviews
FROM departments d
JOIN reviews r ON d.department_id = r.department_id
GROUP BY d.department_name
HAVING average_rating > 4.5
ORDER BY average_rating DESC;`,
    explanation: [
      "Links departments and their reviews by joining on `department_id`.",
      "Groups reviews by department name to calculate aggregates.",
      "Calculates the average rating using the `AVG()` function and count using `COUNT()`.",
      "Filters grouped results to include only those departments whose average rating exceeds 4.5 using the `HAVING` clause.",
      "Sorts departments from highest to lowest average rating."
    ],
    impact: {
      riskLevel: "LOW",
      rowsAffected: 0,
      rowsReturned: 12,
      tables: ["departments", "reviews"],
      warnings: ["None. Safe execution plan."]
    }
  }
};

/**
 * Returns a mock response based on the search query matching one of our keywords,
 * or dynamically builds a fallback mock response if no exact match is found.
 * @param {string} promptText 
 * @returns {Promise<typeof mockResponses[keyof typeof mockResponses]>}
 */
export const getMockResponse = (promptText) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lower = promptText.toLowerCase();
      
      // Attempt to match with one of our core templates
      if (lower.includes("salary") || lower.includes("employee")) {
        resolve(mockResponses.salary);
      } else if (lower.includes("sales") || lower.includes("product")) {
        resolve(mockResponses.sales);
      } else if (lower.includes("customer") || lower.includes("inactive") || lower.includes("register")) {
        resolve(mockResponses.inactive);
      } else if (lower.includes("delete") || lower.includes("log") || lower.includes("prune")) {
        resolve(mockResponses.logs);
      } else if (lower.includes("department") || lower.includes("rating") || lower.includes("group by")) {
        resolve(mockResponses.departments);
      } else {
        // Dynamic fallback matching general structure
        const isDestructive = lower.includes("delete") || lower.includes("drop") || lower.includes("update") || lower.includes("alter");
        resolve({
          sql: isDestructive 
            ? `UPDATE users \nSET status = 'inactive' \nWHERE last_login < DATE_SUB(NOW(), INTERVAL 90 DAY);` 
            : `SELECT id, username, email \nFROM users \nWHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) \nORDER BY last_login DESC;`,
          explanation: [
            isDestructive 
              ? "Updates the `users` table to toggle status fields." 
              : "Selects active accounts from the `users` table.",
            "Filters records matching a computed datetime window.",
            "Enforces constraints or sorting orders on target columns."
          ],
          impact: {
            riskLevel: isDestructive ? "HIGH" : "LOW",
            rowsAffected: isDestructive ? 1500 : 0,
            rowsReturned: isDestructive ? 0 : 85,
            tables: ["users"],
            warnings: [
              isDestructive 
                ? "This modification runs updates without a LIMIT clause, check key indexing." 
                : "Safe SELECT scan executed on the users table."
            ]
          }
        });
      }
    }, 800); // 800ms artificial network delay for native UX loading feel
  });
};
