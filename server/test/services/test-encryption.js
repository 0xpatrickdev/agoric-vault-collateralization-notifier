import test from "ava";
import { generateToken } from "../../src/services/encryption.js";

test("generateToken creates a token with arbitray byte size", async (t) => {
  const bytes = 64;
  const token = generateToken(bytes);
  t.is(token.length, bytes * 2, `token is ${bytes} bytes`);
});
