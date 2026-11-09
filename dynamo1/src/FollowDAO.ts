import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Follow } from "./Follow";

export interface FollowItem {
  follower_handle: string;
  follower_name: string;
  followee_handle: string;
  followee_name: string;
}

export class FollowDAO {
  public constructor(
    private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient({})),
    private readonly tableName = "follows",
  ) {}

  public async put(follow: Follow): Promise<void> {
    const item: FollowItem = {
      follower_handle: follow.follower.alias,
      follower_name: follow.follower.name,
      followee_handle: follow.followee.alias,
      followee_name: follow.followee.name,
    };
    await this.client.send(new PutCommand({ TableName: this.tableName, Item: item }));
  }

  public async get(followerHandle: string, followeeHandle: string): Promise<FollowItem | undefined> {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: { follower_handle: followerHandle, followee_handle: followeeHandle },
      ConsistentRead: true,
    }));
    return result.Item as FollowItem | undefined;
  }

  public async update(
    followerHandle: string,
    followeeHandle: string,
    followerName: string,
    followeeName: string,
  ): Promise<FollowItem> {
    const result = await this.client.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { follower_handle: followerHandle, followee_handle: followeeHandle },
      UpdateExpression: "SET follower_name = :followerName, followee_name = :followeeName",
      ConditionExpression: "attribute_exists(follower_handle) AND attribute_exists(followee_handle)",
      ExpressionAttributeValues: {
        ":followerName": followerName,
        ":followeeName": followeeName,
      },
      ReturnValues: "ALL_NEW",
    }));
    return result.Attributes as FollowItem;
  }

  public async delete(followerHandle: string, followeeHandle: string): Promise<void> {
    await this.client.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { follower_handle: followerHandle, followee_handle: followeeHandle },
    }));
  }
}
