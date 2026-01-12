import bcrypt from "bcrypt";

/**
 * Hash a plain text password
 */
export const hashPassword = async (
  password: string
): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain password with hashed password
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
