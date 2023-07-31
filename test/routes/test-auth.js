import test from "ava";
import dotenv from "dotenv";
import path from "path";
import sinon from "sinon";
import sgMail from "@sendgrid/mail";
import { makeApp } from "../../src/app.js";
import { initDb, resetDb, setupDb, teardownDb } from "../../src/services/db.js";

test.beforeEach(async (t) => {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
  t.context.sgSendStub = sinon.stub(sgMail, "send");
  resetDb();
  t.context.app = await makeApp();
  t.context.db = await setupDb(initDb());
});

test.afterEach.always(async (t) => {
  t.context.sgSendStub.restore();
  if (t.context.db) {
    await teardownDb();
    t.context.db = null;
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

test("verify returns 200 with a valid access token", async (t) => {
  const body = { email: "john@doe.com" };
  const registerResponse = await t.context.app.inject({
    method: "POST",
    url: "register",
    body,
  });
  t.is(registerResponse.statusCode, 200);
  t.true(t.context.sgSendStub.calledOnce, "stubbed sgMail.send() is called");

  // Get the arguments of the first call to sgMail.send()
  const sgSendStubArgs = t.context.sgSendStub.getCall(0).args[0];

  t.is(sgSendStubArgs.from, process.env.SENDGRID_FROM_EMAIL);
  t.is(sgSendStubArgs.subject, "Inter Vault Alterts: Email Verification");
  t.is(sgSendStubArgs.to, body.email);

  // extract access token from the email body
  const accessToken = sgSendStubArgs.text
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