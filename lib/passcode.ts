import * as Crypto from "expo-crypto";

export async function hashPasscode(passcode: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, passcode);
}

export async function verifyPasscode(passcode: string, hash: string): Promise<boolean> {
  return (await hashPasscode(passcode)) === hash;
}
