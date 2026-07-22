export const createUserIdPK = (userId: string): string => {
  return `USERID#${userId}`;
};

export const createUsernamePK = (username: string): string => {
  return `USERNAME#${username}`;
};

export const createUserEmailPK = (email: string): string => {
  return `EMAIL#${email}`;
};
