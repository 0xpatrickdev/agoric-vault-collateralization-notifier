import test from "ava";
import dotenv from "dotenv";
import path from "path";
import { makeApp } from "../src/app.js";
import { initVstorageWatcher } from "../src/vstorageWatcher.js";
import {
  initDb,
  resetDb,
  setupDb,
  teardownDb,
} from "../src/services/db/index.js";

test.beforeEach(async (t) => {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.test"),
    override: true,
  });
  resetDb();
  t.context.app = makeApp({ logger: false });
  initDb();
  t.context.db = await setupDb();
  t.context.vstorage = await initVstorageWatcher();
});

test.afterEach.always(async (t) => {
  if (t.context.db) {
    await teardownDb();
    t.context.app = null;
    t.context.db = null;
    t.context.vstorage = null;
  }
});

test("health check returns 200", async (t) => {
  const response = await t.context.app.inject({
    method: "GET",
    url: "health-check",
  });
  t.is(response.statusCode, 200);
  t.deepEqual(await response.json(), { ok: true });
});
