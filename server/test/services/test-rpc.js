import test from "ava";
import dotenv from "dotenv";
import path from "path";
import { makeApp } from "../../src/app.js";
import { abciQuery } from "../../src/services/rpc.js";
import {
  makeVaultPath,
  makeVbankAssetPath,
} from "../../src/utils/vstoragePaths.js";

test.beforeEach(async (t) => {
    dotenv.config({
      path: path.resolve(process.cwd(), ".env.test"),
      override: true,
    });
  t.context.app = makeApp(); // lockdown called here
});

test.afterEach.always((t) => {
  t.context.app = null;
});

test("abciQuery() query vault data", async (t) => {
  const res = await abciQuery(makeVaultPath(0, 1));
  t.deepEqual(Object.keys(res), ["debtSnapshot", "locked", "vaultState"]);
});

test("abciQuery() query vbankAsset data", async (t) => {
  const res = await abciQuery(makeVbankAssetPath());
  t.truthy(res.find(([_, { issuerName }]) => issuerName === "ATOM"));
  t.truthy(res.find(([denom]) => denom === "ubld"));
  t.truthy(res.find(([denom]) => denom === "uist"));
});

test("abciQuery() query throws error for unknown path", async (t) => {
  const error = await t.throwsAsync(abciQuery(makeVaultPath(999, 999)));
  t.is(error.message, "Error: could not get vstorage path: unknown request");
});
