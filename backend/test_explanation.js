import { explainSQL } from "./src/services/explanationService.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  try {
    const result = await explainSQL(
      "SELECT * FROM employees WHERE salary > 50000;"
    );

    console.log("RESULT:");
    console.log(result);
    console.log("TYPE:", typeof result);
    console.log("IS ARRAY:", Array.isArray(result));
  } catch (error) {
    console.error(error);
  }
})();