import { PublicUserDto, UserDto } from "@cookbook/shared";
import { EmailRow, UsernameRow, UserRow } from "../../dao/interfaces/rows/UserRow.js";
import { createUserEmailPK, createUserIdPK, createUsernamePK } from "../../utils/UserUtils.js";
import { UserParseError } from "../errors/error-code/UserParseError.js";

export class User {
  private _userId: string;
  private _username: string;
  private _email: string;
  private _hashedPassword: string;
  private _profilePictureUrl: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  public constructor(
    userId: string,
    username: string,
    email: string,
    hashedPassword: string,
    profilePictureUrl: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._userId = userId;
    this._username = username;
    this._email = email;
    this._hashedPassword = hashedPassword;
    this._profilePictureUrl = profilePictureUrl;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  public get userId(): string {
    return this._userId;
  }

  public get username(): string {
    return this._username;
  }

  public get email(): string {
    return this._email;
  }

  public get hashedPassword(): string {
    return this._hashedPassword;
  }

  public get profilePictureUrl(): string {
    return this._profilePictureUrl;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public set username(newUsername: string) {
    this._username = newUsername;
  }

  public set email(newEmail: string) {
    this._email = newEmail;
  }

  public set hashedPassword(newHashedPassword: string) {
    this._hashedPassword = newHashedPassword;
  }

  public set profilePictureUrl(newUrl: string) {
    this._profilePictureUrl = newUrl;
  }

  public set updatedAt(date: Date) {
    this._updatedAt = date;
  }

  public toUserRow(): UserRow {
    return {
      pk: createUserIdPK(this.userId),
      type: "user",
      username: this.username,
      email: this.email,
      hashed_password: this.hashedPassword,
      profile_picture_url: this.profilePictureUrl,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  public toUsernameRow(): UsernameRow {
    return {
      pk: createUsernamePK(this.username),
      type: "username_lookup",
      user_id: this.userId,
      created_at: this.createdAt.toISOString(),
    };
  }

  public toEmailRow(): EmailRow {
    return {
      pk: createUserEmailPK(this.email),
      type: "email_lookup",
      user_id: this.userId,
      created_at: this.createdAt.toISOString(),
    };
  }

  public toUserDto(): UserDto {
    return {
      userId: this.userId,
      username: this.username,
      email: this.email,
      profilePictureUrl: this.profilePictureUrl,
      createdAt: this.createdAt.toISOString(),
    };
  }

  public toPublicUserDto(): PublicUserDto {
    return {
      username: this.username,
      profilePictureUrl: this.profilePictureUrl,
    };
  }

  public static toUser(userRow: UserRow): User {
    const userId = userRow.pk.split("#")[1]?.trim();
    if (!userId) {
      throw new UserParseError("No userId found");
    }

    return new User(
      userId,
      userRow.username,
      userRow.email,
      userRow.hashed_password,
      userRow.profile_picture_url,
      new Date(userRow.created_at),
      new Date(userRow.updated_at),
    );
  }
}
