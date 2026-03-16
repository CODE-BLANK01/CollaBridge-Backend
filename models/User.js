export const COLLECTION = "users";

export const VALID_ROLES = ["brand", "creator"];

export function createUserDoc(data, hashedPassword) {
  const now = new Date();
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: hashedPassword,
    role: data.role || "creator",
    createdAt: now,
    updatedAt: now,
  };
}

export function safeUser(doc) {
  const { password, ...rest } = doc;
  return rest;
}

export function validate(data) {
  const errors = [];
  if (!data.name?.trim()) errors.push("name is required");
  if (!data.email?.trim()) errors.push("email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("email must be valid");
  if (!data.password) errors.push("password is required");
  else if (data.password.length < 8)
    errors.push("password must be at least 8 characters");
  if (data.role && !VALID_ROLES.includes(data.role))
    errors.push(`role must be one of: ${VALID_ROLES.join(", ")}`);
  return errors;
}
