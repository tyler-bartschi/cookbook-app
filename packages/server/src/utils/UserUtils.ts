export const createUserIdPK = (userId: string): string => {
  return `USERID#${userId}`;
};

export const createUsernamePK = (username: string): string => {
  username = username.trim().toLowerCase();
  return `USERNAME#${username}`;
};

export const createUserEmailPK = (email: string): string => {
  email = email.trim().toLowerCase();
  return `EMAIL#${email}`;
};
