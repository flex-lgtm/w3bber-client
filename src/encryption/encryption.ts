import NodeRSA from "node-rsa";

export function encryptRSA(plaintext: string, publicKey: NodeRSA.Key): string {
  const key = new NodeRSA();
  key.importKey(publicKey, "pkcs8-public");
  const encrypted = key.encrypt(plaintext, "base64");
  return encrypted;
}

export function decryptRSA(
  ciphertext: string,
  privateKey: NodeRSA.Key
): string {
  const key = new NodeRSA();
  key.importKey(privateKey, "pkcs8-private");
  const decrypted = key.decrypt(ciphertext, "utf8");
  return decrypted;
}
