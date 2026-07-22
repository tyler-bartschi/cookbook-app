import { DataAccessError } from "../../model/errors/error-code/DataAccessError.js";

export class BaseDynamoDao {
  protected async doFailureReportingOperation<T>(
    operation: () => Promise<T>,
    daoName: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.error("An error has occured with message " + errorMessage + " with error:", error);
      throw new DataAccessError(`DataAccess Error from ${daoName}: ${errorMessage}`);
    }
  }
}
