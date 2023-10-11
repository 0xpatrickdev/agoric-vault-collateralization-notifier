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
  initDb();
  t.context.db = await setupDb();
  t.context.vstorage = await initVstorageWatcher();
  // @todo: doesn't work with SES (cannot assign readonly property .toUTCString ...)
  // t.context.clock = sinon.useFakeTimers({
  //   now: Date.now(),
  //   shouldAdvanceTime: true,
  // });
});

test.afterEach.always(async (t) => {
  t.context.postStub.restore();
  t.context.getStub.restore();
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
  }
  t.context.vstorage = null;
  if (t.context.clock?.restore) t.context.clock.restore();
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
  t.deepEqual(await response.json(), { message: "Email address is invalid." });
});

test("register throws when email api is non-responsive", async (t) => {
  t.context.postStub.restore();
  t.context.postStub = sinon.stub(axios, "post").resolves(Promise.reject());
  const response = await t.context.app.inject({
    method: "POST",
    url: "register",
    body: {
      email: "test@test.com",
    },
  });
  t.is(response.statusCode, 500);
  t.deepEqual(response.json(), {
    message:
      "Error sending email. Please try again or use a different address.",
  });
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

test("verify returns 200 with a valid access token", async (t) => {
  const body = { email: "john@doe.com" };
  const registerResponse = await t.context.app.inject({
    method: "POST",
    url: "register",
    body,
  });
  t.is(registerResponse.statusCode, 200);
  t.true(t.context.postStub.calledOnce, "stubbed fetch is called");

  const fetchStubArgs = t.context.postStub.getCall(0).args[1];

  t.is(fetchStubArgs.from, process.env.EMAIL_FROM);
  t.is(fetchStubArgs.subject, "Inter Vault Alerts: Email Verification");
  t.is(fetchStubArgs.to[0], body.email);

  // extract access token from the email body
  const accessToken = fetchStubArgs.text
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
  t.deepEqual(await verifyResponse.json(), { ok: true });
  t.truthy(
    verifyResponse.headers["set-cookie"].includes("HttpOnly"),
    "Authorization header is set"
  );
});

test("verify returns 400 with a invalid access token", async (t) => {
  const body = { email: "john@doe.com" };
  const registerResponse = await t.context.app.inject({
    method: "POST",
    url: "register",
    body,
  });
  t.is(registerResponse.statusCode, 200);
  t.true(t.context.postStub.calledOnce, "stubbed fetch is called");

  const fetchStubArgs = t.context.postStub.getCall(0).args[1];

  t.is(fetchStubArgs.from, process.env.EMAIL_FROM);
  t.is(fetchStubArgs.subject, "Inter Vault Alerts: Email Verification");
  t.is(fetchStubArgs.to[0], body.email);

  // extract access token from the email body
  const accessToken = fetchStubArgs.text
    .split("verify?token=")[1]
    .split(".")[0];

  const verifyResponse1 = await t.context.app.inject({
    method: "POST",
    url: "verify",
    body: {
      token: `WRONG_${accessToken}`,
    },
  });
  t.is(verifyResponse1.statusCode, 400);
  t.deepEqual(verifyResponse1.json(), {
    message: "Unexpected error occured.",
  });
});

// @todo not sure how to stub Date with SES
// test("verify returns 400 with a expired access token", async (t) => {
//   const body = { email: "john@doe.com" };
//   const registerResponse = await t.context.app.inject({
//     method: "POST",
//     url: "register",
//     body,
//   });
//   t.is(registerResponse.statusCode, 200);
//   t.true(t.context.postStub.calledOnce, "stubbed fetch is called");

//   const fetchStubArgs = t.context.postStub.getCall(0).args[1].body;

//   t.is(fetchStubArgs.from, process.env.EMAIL_FROM);
//   t.is(fetchStubArgs.subject, "Inter Vault Alerts: Email Verification");
//   t.is(fetchStubArgs.to[0], body.email);

//   // extract access token from the email body
//   const accessToken = fetchStubArgs.text
//     .split("verify?token=")[1]
//     .split(".")[0];

//   // advance clock by 31 minutes
//   t.context.clock.tick(31 * 60 * 100);

//   const verifyResponse1 = await t.context.app.inject({
//     method: "POST",
//     url: "verify",
//     body: {
//       token: accessToken,
//     },
//   });
//   t.is(verifyResponse1.statusCode, 400);
//   t.deepEqual(verifyResponse1.json(), {
//     error: "Unexpected error occured.",
//   });
// });

