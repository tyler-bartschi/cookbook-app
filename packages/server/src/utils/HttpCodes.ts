export const HTTP_CODES = new Map<string, number>([
  ["success", 200],
  ["created", 201],
  ["no-content", 204],
  ["bad-request", 400],
  ["unauthorized", 401],
  ["forbidden", 403],
  ["not-found", 404],
  ["conflict", 409],
  ["validation-error", 422],
  ["internal-server-error", 500],
]);
