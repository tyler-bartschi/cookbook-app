import { AuthToken, AuthTokenType } from "../../model/entity/AuthToken.js";
import { AuthDao } from "../interfaces/AuthDao.js";
import { serverConfig } from "../../config/serverConfig.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  UpdateCommand,
  UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { BaseDynamoDao } from "./BaseDynamoDao.js";
import { AuthTokenRow } from "../interfaces/rows/AuthTokenRow.js";
import { DataAccessError } from "../../model/errors/error-code/DataAccessError.js";

export class DynamoAuthDao extends BaseDynamoDao implements AuthDao {
  private readonly _shortTermTableName: string = serverConfig.auth.shortTermTableName;
  private readonly _shortTermIndexName: string = serverConfig.auth.shortTermIndexName;
  private readonly _longTermTableName: string = serverConfig.auth.longTermTableName;
  private readonly _longTermIndexName: string = serverConfig.auth.longTermIndexName;
  private readonly _tablePartitionKey: string = serverConfig.auth.tablePartitionKey;
  private readonly _indexPartitionKey: string = serverConfig.auth.indexPartitionKey;
  // private readonly _indexSortKey: string = serverConfig.auth.indexSortKey;
  private readonly _ttlKey: string = serverConfig.auth.ttlKey;
  private readonly _pageSize: number = 10;

  private readonly _client = DynamoDBDocumentClient.from(new DynamoDBClient());

  private readonly _daoName = "AuthDAO";

  public async createAuthToken(token: AuthToken): Promise<void> {
    // converts the token to an AuthTokenRow, writes it into the database
    const tokenRow: AuthTokenRow = token.convertToAuthTokenRow();
    const tokenType: AuthTokenType = token.type;
    const params = {
      TableName: tokenType === "long" ? this._longTermTableName : this._shortTermTableName,
      Item: tokenRow,
      ConditionExpression: "attribute_not_exists(#pk)",
      ExpressionAttributeNames: {
        "#pk": this._tablePartitionKey,
      },
    };

    await this.doFailureReportingOperation<PutCommandOutput>(
      async () => this._client.send(new PutCommand(params)),
      this._daoName,
    );
  }

  public async getShortTermAuthToken(tokenId: string): Promise<AuthToken | null> {
    const params = {
      TableName: this._shortTermTableName,
      Key: { [this._tablePartitionKey]: tokenId },
    };

    return await this.doFailureReportingOperation<AuthToken | null>(async () => {
      const result = await this._client.send(new GetCommand(params));

      return result.Item == undefined ? null : AuthToken.toAuthToken(result.Item as AuthTokenRow);
    }, this._daoName);
  }

  public async getLongTermAuthToken(tokenId: string): Promise<AuthToken | null> {
    const params = {
      TableName: this._longTermTableName,
      Key: { [this._tablePartitionKey]: tokenId },
    };

    return await this.doFailureReportingOperation<AuthToken | null>(async () => {
      const result = await this._client.send(new GetCommand(params));

      return result.Item == undefined ? null : AuthToken.toAuthToken(result.Item as AuthTokenRow);
    }, this._daoName);
  }

  public async updateAuthToken(token: AuthToken): Promise<void> {
    const tokenRow: AuthTokenRow = token.convertToAuthTokenRow();
    const tokenType: AuthTokenType = token.type;
    const params = {
      TableName: tokenType === "long" ? this._longTermTableName : this._shortTermTableName,
      Key: { [this._tablePartitionKey]: tokenRow.token_id },
      ConditionExpression: "attribute_exists(#token_id)",
      UpdateExpression:
        "SET #last_used_at = :last_used_at, #expires_at = :expires_at, #revoked_at = :revoked_at, #ttl_at = :ttl_at",
      ExpressionAttributeNames: {
        "#token_id": this._tablePartitionKey,
        "#last_used_at": "last_used_at",
        "#expires_at": "expires_at",
        "#revoked_at": "revoked_at",
        "#ttl_at": this._ttlKey,
      },
      ExpressionAttributeValues: {
        ":last_used_at": tokenRow.last_used_at,
        ":expires_at": tokenRow.expires_at,
        ":revoked_at": tokenRow.revoked_at,
        ":ttl_at": tokenRow.ttl_at,
      },
    };

    await this.doFailureReportingOperation<UpdateCommandOutput>(
      async () => await this._client.send(new UpdateCommand(params)),
      this._daoName,
    );
  }

  public async getAllActiveShortTermAuthTokens(userId: string): Promise<AuthToken[]> {
    return await this.getAllAuthTokens(userId, "short");
  }

  public async getAllActiveLongTermAuthTokens(userId: string): Promise<AuthToken[]> {
    return await this.getAllAuthTokens(userId, "long");
  }

  public async updateMultipleAuthTokens(tokens: AuthToken[]): Promise<void> {
    const chunkSize: number = 5;
    const failures: string[] = [];

    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk: AuthToken[] = tokens.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map((token: AuthToken) => this.updateAuthToken(token)),
      );

      results.forEach((item) => {
        if (item.status === "rejected") {
          const reason = item.reason;
          failures.push(reason instanceof Error ? reason.message : String(reason));
        }
      });
    }

    if (failures.length > 0) {
      throw new DataAccessError(`Error updating one or more auth tokens:\n${failures.join("\n")}`);
    }
  }

  private async getAllAuthTokens(userId: string, type: AuthTokenType): Promise<AuthToken[]> {
    return await this.doFailureReportingOperation(async () => {
      const tokens: AuthToken[] = [];
      let hasMoreTokens = true;
      let cursor: QueryCommandOutput["LastEvaluatedKey"] = undefined;
      const now = Date.now();

      while (hasMoreTokens) {
        const params: QueryCommandInput = {
          TableName: type === "short" ? this._shortTermTableName : this._longTermTableName,
          KeyConditionExpression: `#partition_key = :partition_key`,
          ExpressionAttributeNames: {
            "#partition_key": this._indexPartitionKey,
          },
          ExpressionAttributeValues: {
            ":partition_key": userId,
          },
          Limit: this._pageSize,
          IndexName: type === "short" ? this._shortTermIndexName : this._longTermIndexName,
          ExclusiveStartKey: cursor,
        };

        const data = await this._client.send(new QueryCommand(params));
        const items: AuthToken[] =
          data.Items?.map((item: unknown) => AuthToken.toAuthToken(item as AuthTokenRow)) ?? [];

        const filteredItems: AuthToken[] = items.filter(
          (item: AuthToken) => item.revokedAt === null && item.expiresAt.getTime() > now,
        );

        tokens.push(...filteredItems);
        hasMoreTokens = data.LastEvaluatedKey !== undefined;
        cursor = data.LastEvaluatedKey;
      }

      return tokens;
    }, this._daoName);
  }
}
