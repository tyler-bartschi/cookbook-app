export class ClientResponseValidationError extends Error {
  public readonly status: number;
  public constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options);
    this.status = status;
    this.name = "ClientResponseValidationError";
  }
}
