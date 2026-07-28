import {
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
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

  public async updateUser(user: User): Promise<void> {
    const userRow: UserRow = user.toUserRow();
    const params = {
      TableName: this._userTableName,
      Key: { [this._userPartitionKey]: createUserIdPK(user.userId) },
      ConditionExpression: "attribute_exists(#user_id)",
      UpdateExpression:
        "SET #hashed_password = :hashed_password, #profile_picture_url = :profile_picture_url, #updated_at = :updated_at",
      ExpressionAttributeNames: {
        "#user_id": this._userPartitionKey,
        "#hashed_password": "hashed_password",
        "#profile_picture_url": "profile_picture_url",
        "#updated_at": "updated_at",
      },
      ExpressionAttributeValues: {
        ":hashed_password": userRow.hashed_password,
        ":profile_picture_url": userRow.profile_picture_url,
        ":updated_at": userRow.updated_at,
      },
    };

    await this.doFailureReportingOperation(
      async () => await this._client.send(new UpdateCommand(params)),
      this._daoName,
    );
  }

  public async updateUsername(user: User, currentUsername: string): Promise<void> {
    const userItem = user.toUserRow();
    const usernameItem = user.toUsernameRow();

    await this.doFailureReportingOperation(async () => {
      await this._client.send(
        new TransactWriteCommand({
          ClientRequestToken: crypto.randomUUID(),
          TransactItems: [
            {
              Put: {
                TableName: this._userTableName,
                Item: usernameItem,
                ConditionExpression: "attribute_not_exists(#pk)",
                ExpressionAttributeNames: { "#pk": this._userPartitionKey },
              },
            },
            {
              Update: {
                TableName: this._userTableName,
                Key: { [this._userPartitionKey]: userItem.pk },
                ConditionExpression: "attribute_exists(#pk)",
                UpdateExpression: "SET #username = :username, #updated_at = :updated_at",
                ExpressionAttributeNames: {
                  "#pk": this._userPartitionKey,
                  "#username": "username",
                  "#updated_at": "updated_at",
                },
                ExpressionAttributeValues: {
                  ":username": userItem.username,
                  ":updated_at": userItem.updated_at,
                },
              },
            },
            {
              Delete: {
                TableName: this._userTableName,
                Key: { [this._userPartitionKey]: createUsernamePK(currentUsername) },
                ConditionExpression: "attribute_exists(#pk)",
                ExpressionAttributeNames: {
                  "#pk": this._userPartitionKey,
                },
              },
            },
          ],
        }),
      );
    }, this._daoName);
  }

  public async updateEmail(user: User, currentEmail: string): Promise<void> {
    const userItem = user.toUserRow();
    const emailItem = user.toEmailRow();

    await this.doFailureReportingOperation(async () => {
      await this._client.send(
        new TransactWriteCommand({
          ClientRequestToken: crypto.randomUUID(),
          TransactItems: [
            {
              Put: {
                TableName: this._userTableName,
                Item: emailItem,
                ConditionExpression: "attribute_not_exists(#pk)",
                ExpressionAttributeNames: { "#pk": this._userPartitionKey },
              },
            },
            {
              Update: {
                TableName: this._userTableName,
                Key: { [this._userPartitionKey]: userItem.pk },
                ConditionExpression: "attribute_exists(#pk)",
                UpdateExpression: "SET #email = :email, #updated_at = :updated_at",
                ExpressionAttributeNames: {
                  "#pk": this._userPartitionKey,
                  "#email": "email",
                  "#updated_at": "updated_at",
                },
                ExpressionAttributeValues: {
                  ":email": userItem.email,
                  ":updated_at": userItem.updated_at,
                },
              },
            },
            {
              Delete: {
                TableName: this._userTableName,
                Key: { [this._userPartitionKey]: createUserEmailPK(currentEmail) },
                ConditionExpression: "attribute_exists(#pk)",
                ExpressionAttributeNames: {
                  "#pk": this._userPartitionKey,
                },
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
