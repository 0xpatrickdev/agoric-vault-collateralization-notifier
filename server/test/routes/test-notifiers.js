import test from "ava";
import dotenv from "dotenv";
import path from "path";
import sinon from "sinon";
import axios from "axios";
import { makeApp } from "../../src/app.js";
import {
  initDb,
  resetDb,
  setupDb,
  teardownDb,
} from "../../src/services/db/index.js";
import { initVstorageWatcher } from "../../src/vstorageWatcher.js";

test.beforeEach(async (t) => {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.test"),
    override: true,
  });
  const resp = Promise.resolve({
    status: 200,
    ok: true,
  });
  t.context.postStub = sinon.stub(axios, "post").resolves(resp);
  t.context.getStub = sinon.stub(axios, "get").resolves(resp);
  resetDb();
  t.context.app = makeApp({ logger: false });
  t.context.db = await setupDb(initDb());
  t.context.vstorage = await initVstorageWatcher();

  // register a user
  const body = { email: "john@doe.com" };
  await t.context.app.inject({
    method: "POST",
    url: "register",
    body,
  });
  const verifyResponse = await t.context.app.inject({
    method: "POST",
    url: "verify",
    body: {
      token: t.context.postStub
        .getCall(0)
        .args[1].text.split("verify?token=")[1]
        .split(".")[0],
    },
  });
  if (!verifyResponse.headers["set-cookie"].includes("HttpOnly")) {
    throw new Error("Error getting jwt token.");
  }
  t.context.headers = { cookie: verifyResponse.headers["set-cookie"] };
});

test.afterEach.always(async (t) => {
  t.context.postStub.restore();
  t.context.getStub.restore();
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
  }
  t.context.app = null;
  t.context.vstorage = null;
});

test("user can create notifiers", async (t) => {
  const body = { vaultManagerId: 0, vaultId: 20, collateralizationRatio: 250 };
  const response = await t.context.app.inject({
    method: "POST",
    url: "notifiers",
    body,
    headers: t.context.headers,
  });
  t.is(response.statusCode, 200);
  t.deepEqual(await response.json(), { ok: true });
});

test("notifier user input sanitization", async (t) => {
  const defaultArgs = {
    vaultManagerId: 0,
    vaultId: 20,
    collateralizationRatio: 250,
  };

  const test = async (params, error) => {
    const response = await t.context.app.inject({
      method: "POST",
      url: "notifiers",
      body: Object.assign({}, defaultArgs, params),
      headers: t.context.headers,
    });
    t.is(response.statusCode, 400);
    t.deepEqual(await response.json(), { message: error }, error);
  };

  const testCases = [
    [{ vaultManagerId: "test" }, "Vault Manager ID must be a positive integer"],
    [{ vaultId: -5 }, "Vault ID must be a positive integer"],
    [
      { collateralizationRatio: null },
      "Collateralization Ratio must be a positive integer",
    ],
    [
      { collateralizationRatio: -5 },
      "Collateralization Ratio must be a positive integer",
    ],
    [{ vaultManager: 0, vaultId: 9999999999 }, "Vault does not exist"],
    [{ vaultManager: 0, vaultId: 3 }, "Vault is inactive"],
  ];

  await Promise.all(testCases.map((x) => test(...x)));
});

test("unauthorized user cannot create notifiers", async (t) => {
  const body = { vaultManagerId: 0, vaultId: 20, collateralizationRatio: 250 };
  const postResponse = await t.context.app.inject({
    method: "POST",
    url: "notifiers",
    body,
  });
  t.is(postResponse.statusCode, 401);
  t.deepEqual(await postResponse.json(), { message: "Unauthorized" });
});

test("unauthorized user cannot read notifiers", async (t) => {
  const readResponse = await t.context.app.inject({
    method: "POST",
    url: "notifiers",
  });
  t.is(readResponse.statusCode, 401);
  t.deepEqual(await readResponse.json(), { message: "Unauthorized" });
});

test("user can retrieve their own notifiers", async (t) => {
  await Promise.all(
    [230, 240, 250].map((x) =>
      t.context.app.inject({
        method: "POST",
        url: "notifiers",
        body: { vaultManagerId: 0, vaultId: 20, collateralizationRatio: x },
        headers: t.context.headers,
      })
    )
  );
  const response = await t.context.app.inject({
    method: "GET",
    url: "notifiers",
    headers: t.context.headers,
  });
  t.is(response.statusCode, 200);
  t.like(await response.json(), [
    {
      collateralizationRatio: 230,
      userId: 1,
      vaultId: 20,
      vaultManagerId: 0,
    },
    {
      collateralizationRatio: 240,
      userId: 1,
      vaultId: 20,
      vaultManagerId: 0,
    },
    {
      collateralizationRatio: 250,
      userId: 1,
      vaultId: 20,
      vaultManagerId: 0,
    },
  ]);
});

test("user can delete their own notifiers", async (t) => {
  await t.context.app.inject({
    method: "POST",
    url: "notifiers",
    body: { vaultManagerId: 0, vaultId: 20, collateralizationRatio: 250 },
    headers: t.context.headers,
  });

  const notifiers1 = await t.context.app.inject({
    method: "GET",
    url: "notifiers",
    headers: t.context.headers,
  });
  const firstNotifierId = await notifiers1.json()[0].id;
  t.is(!isNaN(firstNotifierId) && firstNotifierId > 0, true);

  const deleteRes = await t.context.app.inject({
    method: "DELETE",
    url: `notifiers/${firstNotifierId}`,
    headers: t.context.headers,
  });
  t.is(deleteRes.statusCode, 200);

  const notifiers2 = await t.context.app.inject({
    method: "GET",
    url: "notifiers",
    headers: t.context.headers,
  });
  t.is(await notifiers2.json().length, 0);
});

// @todo test a user can't delete someone else's notifier
