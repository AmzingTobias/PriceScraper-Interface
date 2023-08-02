import bcrypt from "bcrypt";

export const hashPassword = async (raw_password: string): Promise<string> => {
  const saltRounds = 8;
  const hashed_password = await bcrypt.hash(raw_password, saltRounds);
  return hashed_password;
};

export const compare_hashed_password = async (
  raw_password: string,
  hashed_password: string
): Promise<boolean> => {
  return await bcrypt.compare(raw_password, hashed_password);
};
