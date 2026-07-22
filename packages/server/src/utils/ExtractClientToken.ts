export const extractClientToken = (clientToken: string): string | undefined => {
  return clientToken.startsWith("Bearer ") ? clientToken.slice("Bearer ".length) : undefined;
};
