import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../../model/entity/User.js";
import { UserDao } from "../interfaces/UserDao.js";
import { BaseDynamoDao } from "./BaseDynamoDao.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { serverConfig } from "../../config/serverConfig.js";
import { createUserEmailPK, createUserIdPK, createUsernamePK } from "../../utils/UserUtils.js";
import { EmailRow, UsernameRow, UserRow } from "../interfaces/rows/UserRow.js";

export class DynamoUserDao extends BaseDynamoDao implements UserDao {
  private readonly _userTableName: string = serverConfig.users.tableName;
  private readonly _userPartitionKey: string = serverConfig.users.partitionKey;

  private readonly _client = DynamoDBDocumentClient.from(new DynamoDBClient());

  private readonly _daoName = "UserDao";

  public async getUserById(userId: string): Promise<User | null> {
    const params = {
      TableName: this._userTableName,
      Key: { [this._userPartitionKey]: createUserIdPK(userId) },
    };

    return await this.doFailureReportingOperation<User | null>(async () => {
      const result = await this._client.send(new GetCommand(params));

      return result.Item == undefined ? null : User.toUser(result.Item as UserRow);
    }, this._daoName);
  }

  public async getUserByUsername(username: string): Promise<User | null> {
    return await this.getUserByLookup(createUsernamePK(username));
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await this.getUserByLookup(createUserEmailPK(email));
  }

  public async createUser(user: User): Promise<void> {
    // needs to create the user, username lookup, and email lookup
    const userItem = user.toUserRow();
    const usernameItem = user.toUsernameRow();
    const emailItem = user.toEmailRow();

    const conditionExpression = "attribute_not_exists(#pk)";
    const expressionAttributeNames = { "#pk": this._userPartitionKey };

    await this.doFailureReportingOperation(async () => {
      await this._client.send(
        new TransactWriteCommand({
          ClientRequestToken: crypto.randomUUID(),
          TransactItems: [
            {
              Put: {
                TableName: this._userTableName,
                Item: userItem,
                ConditionExpression: conditionExpression,
                ExpressionAttributeNames: expressionAttributeNames,
              },
            },

            {
              Put: {
                TableName: this._userTableName,
                Item: usernameItem,
                ConditionExpression: conditionExpression,
                ExpressionAttributeNames: expressionAttributeNames,
              },
            },

            {
              Put: {
                TableName: this._userTableName,
                Item: emailItem,
                ConditionExpression: conditionExpression,
                ExpressionAttributeNames: expressionAttributeNames,
              },
            },
          ],
        }),
      );
    }, this._daoName);
  }

  private async getUserByLookup(pk: string): Promise<User | null> {
    const params = {
      TableName: this._userTableName,
      Key: { [this._userPartitionKey]: pk },
    };

    return await this.doFailureReportingOperation<User | null>(async () => {
      const result = await this._client.send(new GetCommand(params));

      if (result.Item == undefined) {
        return null;
      }

      const userId = (result.Item as UsernameRow | EmailRow).user_id;
      return await this.getUserById(userId);
    }, this._daoName);
  }
}
