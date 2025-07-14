const testData = {
  batch_number: `TEST-DEBUG-${Date.now()}`,
  raw_materials: [{ product_code: "RM001", quantity: 1 }],
  output: [],
  status: "in_progress",
  start_date: new Date().toISOString(),
};

console.log("Testing WIP POST with data:");
console.log(JSON.stringify(testData, null, 2));

// This would be the equivalent of what the frontend is doing
fetch("http://localhost:3000/api/wip", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(testData),
})
  .then((response) => {
    console.log("Response status:", response.status);
    return response.text();
  })
  .then((text) => {
    console.log("Response body:", text);
    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
    } catch (e) {
      console.log("Response is not JSON");
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
