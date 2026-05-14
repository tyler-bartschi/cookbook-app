export class User {
  private _id: string;
  private _username: string;
  private _email: string;
  private _hashedPassword: string;
  private _profilePictureUrl: string;
  private _createdAt: Date | undefined;
  private _updatedAt: Date | undefined;

  public constructor(
    id: string,
    username: string,
    email: string,
    hashedPassword: string,
    profilePictureUrl: string = "",
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this._id = id;
    this._username = username;
    this._email = email;
    this._hashedPassword = hashedPassword;
    this._profilePictureUrl = profilePictureUrl;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  public get id(): string {
    return this._id;
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

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

}
