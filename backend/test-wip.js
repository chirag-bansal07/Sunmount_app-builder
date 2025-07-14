const fetch = require("node-fetch");

async function testWIPWorkflow() {
  const baseUrl = "http://localhost:3000";

  try {
    console.log("🧪 Testing WIP workflow...");

    // 1. Check current inventory
    console.log("\n📦 Checking current inventory...");
    const inventoryResponse = await fetch(`${baseUrl}/api/inventory`);
    const inventory = await inventoryResponse.json();

    const rm001 = inventory.find((p) => p.product_code === "RM001");
    if (!rm001) {
      console.error("❌ RM001 not found in inventory");
      return;
    }

    console.log(`✅ RM001 current quantity: ${rm001.quantity}`);

    // 2. Create a test WIP batch
    console.log("\n🏭 Creating test WIP batch...");
    const wipData = {
      batch_number: `TEST-WIP-${Date.now()}`,
      raw_materials: [{ product_code: "RM001", quantity: 2 }],
      output: [{ product_code: "FG001", quantity: 1 }],
      status: "in_progress",
      start_date: new Date().toISOString(),
    };

    console.log("📤 Sending WIP data:", wipData);

    const createResponse = await fetch(`${baseUrl}/api/wip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wipData),
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log("✅ WIP batch created:", result.message);

      // 3. Check inventory after creation
      console.log("\n📦 Checking inventory after WIP creation...");
      const inventoryAfterResponse = await fetch(`${baseUrl}/api/inventory`);
      const inventoryAfter = await inventoryAfterResponse.json();

      const rm001After = inventoryAfter.find((p) => p.product_code === "RM001");
      console.log(
        `✅ RM001 quantity after WIP creation: ${rm001After.quantity}`,
      );
      console.log(
        `📊 Quantity deducted: ${rm001.quantity - rm001After.quantity}`,
      );

      // 4. Complete the WIP batch
      console.log("\n✅ Completing WIP batch...");
      const completeResponse = await fetch(
        `${baseUrl}/api/wip/${wipData.batch_number}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            end_date: new Date().toISOString(),
            output: [{ product_code: "FG001", quantity: 1 }],
          }),
        },
      );

      if (completeResponse.ok) {
        const completeResult = await completeResponse.json();
        console.log("✅ WIP batch completed:", completeResult.message);

        // 5. Check final inventory
        console.log("\n📦 Checking final inventory...");
        const finalInventoryResponse = await fetch(`${baseUrl}/api/inventory`);
        const finalInventory = await finalInventoryResponse.json();

        const fg001Final = finalInventory.find(
          (p) => p.product_code === "FG001",
        );
        if (fg001Final) {
          console.log(
            `✅ FG001 quantity after completion: ${fg001Final.quantity}`,
          );
        } else {
          console.log("❌ FG001 not found in inventory after completion");
        }

        console.log("\n🎉 WIP workflow test completed successfully!");
      } else {
        const error = await completeResponse.text();
        console.error("❌ Failed to complete WIP batch:", error);
      }
    } else {
      const error = await createResponse.text();
      console.error("❌ Failed to create WIP batch:", error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testWIPWorkflow();
