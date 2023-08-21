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
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  const resp = Promise.resolve({
    status: 200,
    ok: true,
    json: () => Promise.resolve({ data: "Mocked data" }),
  });
  t.context.postStub = sinon.stub(axios, "post").resolves(resp);
  t.context.getStub = sinon.stub(axios, "get").resolves(resp);
  resetDb();
  t.context.app = makeApp();
  t.context.db = await setupDb(initDb());
  t.context.vstorage = await initVstorageWatcher();
});

test.afterEach.always(async (t) => {
  t.context.postStub.restore();
  t.context.getStub.restore();
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
    t.context.vstorage = null;
  }
});

test("register throws an error when an invalid email is provided", async (t) => {
  const response = await t.context.app.inject({
    method: "POST",
    url: "register",
    body: {
      email: "test",
    },
  });
  t.is(response.statusCode, 400);
  t.deepEqual(await response.json(), { error: "Invalid email address." });
});

test("register returns 200 when valid email is provided", async (t) => {
  const response = await t.context.app.inject({
    method: "POST",
    url: "register",
    body: {
      email: "john@doe.com",
    },
  });
  t.is(response.statusCode, 200);
  t.deepEqual(await response.json(), {
    message: "Verification email sent. Please check your email.",
  });
});

test.only("verify returns 200 with a valid access token", async (t) => {
  const body = { email: "john@doe.com" };
  const registerResponse = await t.context.app.inject({
    method: "POST",
    url: "register",
    body,
  });
  t.is(registerResponse.statusCode, 200);
  t.true(t.context.postStub.calledOnce, "stubbed fetch is called");

  const fetchStubArgs = t.context.postStub.getCall(0).args[1].body;

  t.is(fetchStubArgs.get("from"), process.env.EMAIL_FROM);
  t.is(fetchStubArgs.get("subject"), "Inter Vault Alerts: Email Verification");
  t.is(fetchStubArgs.get("to"), body.email);

  // extract access token from the email body
  const accessToken = fetchStubArgs
    .get("text")
    .split("verify?token=")[1]
    .split(".")[0];

  const verifyResponse = await t.context.app.inject({
    method: "POST",
    url: "verify",
    body: {
      token: accessToken,
    },
  });

  t.is(verifyResponse.statusCode, 200);
  t.deepEqual(await verifyResponse.json(), { success: true });
  t.truthy(
    verifyResponse.headers.authorization.includes("Bearer "),
    "Authorization header is set"
  );
});

// @todo: add test for expired access token
// @todo: add test for invalid access token