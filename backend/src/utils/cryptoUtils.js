import crypto from "crypto";

const base64url = (str) => {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const fromBase64url = (str) => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
};

/**
 * Creates a stateless signed JWT-style token.
 * @param {object} payload 
 * @param {string} secret 
 * @param {number} expiresInSeconds 
 * @returns {string} The signed token string
 */
export const signToken = (payload, secret, expiresInSeconds) => {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = base64url(
    crypto.createHmac("sha256", secret).update(signatureInput).digest("base64")
  );
  
  return `${signatureInput}.${signature}`;
};

/**
 * Verifies the stateless token signature and expiration.
 * @param {string} token 
 * @param {string} secret 
 * @returns {object|null} The verified payload or null if invalid/expired
 */
export const verifyToken = (token, secret) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = base64url(
      crypto.createHmac("sha256", secret).update(signatureInput).digest("base64")
    );
    
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(fromBase64url(encodedPayload));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

/**
 * Hashes a plaintext password using PBKDF2 with salt.
 * @param {string} password 
 * @returns {string} salt:hash format string
 */
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

/**
 * Verifies a plaintext password against a PBKDF2 hash.
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {boolean} True if matched, false otherwise
 */
export const verifyPassword = (password, hashedPassword) => {
  try {
    const [salt, originalHash] = hashedPassword.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch (err) {
    return false;
  }
};
