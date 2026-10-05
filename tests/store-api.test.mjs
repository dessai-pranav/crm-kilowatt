import test from "node:test";
import assert from "node:assert";
import { GET as getConfig, POST as postConfig } from "../src/app/api/store/config/route.ts";
import { POST as testConnection } from "../src/app/api/store/test/route.ts";
import { POST as syncStore } from "../src/app/api/store/sync/route.ts";
import { prisma } from "../src/lib/prisma.ts";

test("API: /api/store/config returns configuration and updates settings", async () => {
  const getRes = await getConfig();
  assert.strictEqual(getRes.status, 200);
  const data = await getRes.json();
  assert.ok(data.storeUrl);
  assert.strictEqual(data.isMockMode, true);

  const postReq = new Request("http://localhost:3000/api/store/config", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ isMockMode: true, storeUrl: "https://kilowatt-gear.demo" }),
  });
  const postRes = await postConfig(postReq);
  assert.strictEqual(postRes.status, 200);
});

test("API: /api/store/test returns connection status", async () => {
  const req = new Request("http://localhost:3000/api/store/test", {
    method: "POST",
  });
  const res = await testConnection(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.storeInfo);
});

test("API: /api/store/sync triggers synchronization and records SyncLog", async () => {
  const req = new Request("http://localhost:3000/api/store/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ source: "api_unit_test" }),
  });
  const res = await syncStore(req);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.customersSynced >= 0);

  const syncLog = await prisma.syncLog.findFirst({
    where: { source: "api_unit_test" },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(syncLog);
  assert.strictEqual(syncLog.status, "success");
});
