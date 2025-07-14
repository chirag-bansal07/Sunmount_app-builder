// Simple test to verify WIP creation works
const testData = {
  batch_number: `TEST-${Date.now()}`,
  raw_materials: [{ product_code: "RM001", quantity: 1 }],
  output: [],
  status: "in_progress",
  start_date: new Date().toISOString(),
};

console.log("Test data that should work:");
console.log(JSON.stringify(testData, null, 2));

console.log("\nKey points:");
console.log(
  "- batch_number:",
  typeof testData.batch_number,
  testData.batch_number,
);
console.log("- raw_materials is array:", Array.isArray(testData.raw_materials));
console.log("- quantity type:", typeof testData.raw_materials[0].quantity);
console.log(
  "- product_code type:",
  typeof testData.raw_materials[0].product_code,
);
console.log("- output is array:", Array.isArray(testData.output));
console.log("- status:", typeof testData.status, testData.status);
console.log("- start_date:", typeof testData.start_date, testData.start_date);
