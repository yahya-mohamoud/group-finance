import test from "node:test";
import assert from "node:assert/strict";
import {
  validatePinFormat,
  hashPin,
  verifyPinHash,
} from "../src/lib/auth/pin";
import {
  signToken,
  verifySignedToken,
} from "../src/lib/auth/session";

test("validatePinFormat accepts exactly 4 numeric digits", () => {
  assert.equal(validatePinFormat("1234"), true);
  assert.equal(validatePinFormat("0000"), true);
  assert.equal(validatePinFormat("9999"), true);
  assert.equal(validatePinFormat("0123"), true);

  // Rejections
  assert.equal(validatePinFormat("123"), false, "Must reject 3 digits");
  assert.equal(validatePinFormat("12345"), false, "Must reject 5 digits");
  assert.equal(validatePinFormat("12a4"), false, "Must reject letters");
  assert.equal(validatePinFormat(" 123"), false, "Must reject leading spaces");
  assert.equal(validatePinFormat("123 "), false, "Must reject trailing spaces");
  assert.equal(validatePinFormat(""), false, "Must reject empty string");
  assert.equal(validatePinFormat(null as any), false, "Must reject null");
  assert.equal(validatePinFormat(undefined as any), false, "Must reject undefined");
});

test("hashPin and verifyPinHash with Argon2id", async () => {
  const pin = "4826";
  const hash = await hashPin(pin);

  // Hash must not equal plaintext PIN
  assert.notEqual(hash, pin);
  assert.ok(hash.startsWith("$argon2id$"), "Hash should use Argon2id");

  // Correct verification
  const isMatch = await verifyPinHash(hash, "4826");
  assert.equal(isMatch, true);

  // Wrong PIN verification
  const isWrong = await verifyPinHash(hash, "1111");
  assert.equal(isWrong, false);

  // Invalid format candidate
  const isInvalidFormat = await verifyPinHash(hash, "482");
  assert.equal(isInvalidFormat, false);
});

test("Session token HMAC signing and tamper detection", async () => {
  const token = "abcdef1234567890abcdef1234567890";
  const signed = await signToken(token);

  assert.ok(signed.startsWith(token + "."), "Signed token contains raw token and signature");

  // Valid verification returns the original token
  const verified = await verifySignedToken(signed);
  assert.equal(verified, token);

  // Tampered token fails
  const tamperedToken = "x" + signed.slice(1);
  const tamperedResult = await verifySignedToken(tamperedToken);
  assert.equal(tamperedResult, null);

  // Tampered signature fails
  const [rawToken, sig] = signed.split(".");
  const badSig = rawToken + "." + sig.slice(0, -2) + "00";
  const badSigResult = await verifySignedToken(badSig);
  assert.equal(badSigResult, null);

  // Unsigned or malformed string fails
  assert.equal(await verifySignedToken("randomstringwithoutdots"), null);
  assert.equal(await verifySignedToken(""), null);
  assert.equal(await verifySignedToken(undefined), null);
});
