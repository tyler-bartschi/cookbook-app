import { env } from "./env.js";

export const serverConfig = {
  general: {
    awsRegion: env.AWS_REGION,
  },
  users: {
    tableName: env.USERS_DB_NAME,
    partitionKey: "pk",
  },
  auth: {
    shortTermTableName: env.SHORT_TERM_AUTH_DB_NAME,
    shortTermIndexName: env.SHORT_TERM_AUTH_DB_INDEX_NAME,
    longTermTableName: env.LONG_TERM_AUTH_DB_NAME,
    longTermIndexName: env.LONG_TERM_AUTH_DB_INDEX_NAME,

    // The following is shared by both the long term and short term tables
    tablePartitionKey: "token_id",
    ttlKey: "ttl_at",
    indexPartitionKey: "username",
    indexSortKey: "created_at",
  },
  profilePictures: {
    bucketName: env.PROFILE_PICTURE_S3_BUCKET_NAME,
  },
} as const;
