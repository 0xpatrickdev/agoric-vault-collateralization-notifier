import test from "ava";
import dotenv from "dotenv";
import path from "path";
import { makeApp } from "../src/app.js";
import { initDb, resetDb, setupDb, teardownDb } from "../src/services/db.js";

test.beforeEach(async (t) => {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  resetDb();
  t.context.app = makeApp({ logger: false });
  t.context.db = await setupDb(initDb());
});

test.afterEach.always(async (t) => {
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
  }
});

test("health check returns 200", async (t) => {
  const response = await t.context.app.inject({
    method: "GET",
    url: "health-check",
  });
  t.is(response.statusCode, 200);
  t.deepEqual(await response.json(), { success: true });
});
