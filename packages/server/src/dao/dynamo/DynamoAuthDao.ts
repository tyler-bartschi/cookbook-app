import { AuthToken, AuthTokenType } from "../../model/entity/AuthToken.js";
import { AuthDao } from "../interfaces/AuthDao.js";
import { serverConfig } from "../../config/serverConfig.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  PutCommandOutput,
  UpdateCommand,
  UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { BaseDynamoDao } from "./BaseDynamoDao.js";
import { AuthTokenRow } from "../interfaces/rows/AuthTokenRow.js";

export class DynamoAuthDao extends BaseDynamoDao implements AuthDao {
  private readonly _shortTermTableName: string = serverConfig.auth.shortTermTableName;
  // private readonly _shortTermIndexName: string = serverConfig.auth.shortTermIndexName;
  private readonly _longTermTableName: string = serverConfig.auth.longTermTableName;
  // private readonly _longTermIndexName: string = serverConfig.auth.longTermIndexName;
  private readonly _tablePartitionKey: string = serverConfig.auth.tablePartitionKey;
  // private readonly _indexPartitionKey: string = serverConfig.auth.indexPartitionKey;
  // private readonly _indexSortKey: string = serverConfig.auth.indexSortKey;
  private readonly _ttlKey: string = serverConfig.auth.ttlKey;

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
}
