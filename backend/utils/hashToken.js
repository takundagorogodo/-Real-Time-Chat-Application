import crypto from "crypto";

export const hashToken = (token) => {
  if (!token) return null;
  return crypto
    .createHash("sha256") 
    .update(token)
    .digest("hex");
};