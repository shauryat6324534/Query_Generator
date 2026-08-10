async function check() {
  console.log("Fetching http://localhost:5000/history...");
  try {
    const res = await fetch("http://localhost:5000/history");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

check();
