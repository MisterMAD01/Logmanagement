const client = require("../config/config"); // OpenSearch client

async function deleteOldLogs() {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const result = await client.deleteByQuery({
    index: "logs",
    body: {
      query: {
        range: {
          "@timestamp": { lt: sevenDaysAgo },
        },
      },
    },
    refresh: true, // อัปเดต index หลัง delete
  });

  // สำหรับ OpenSearch JS client รุ่นใหม่
  console.log("Deleted logs:", result.body?.deleted || 0);
}

deleteOldLogs().catch(console.error);
