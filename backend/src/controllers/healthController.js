/**
 * Health Controller
 * Simple controller to handle health checks.
 */
export const getHealth = (req, res) => {
  res.status(200).json({ status: "ok" });
};
