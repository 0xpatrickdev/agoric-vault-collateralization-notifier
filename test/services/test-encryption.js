import test from "ava";
import dotenv from "dotenv";
import path from "path";
import {
  generateToken,
  hashToken,
  verifyToken,
} from "../../src/services/encryption.js";

test.beforeEach(async (t) => {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
});

test("generateToken creates a token with arbitray byte size", async (t) => {
  const bytes = 64;
  const token = generateToken(bytes);
  t.is(token.length, bytes * 2, `token is ${bytes} bytes`);
});

test("brcrypt hashToken and verifyToken wrappers", async (t) => {
  const token = generateToken();
  const hashedToken = await hashToken(token);
  t.true(await verifyToken(token, hashedToken));
  t.false(await verifyToken("not the token", hashedToken));
});
