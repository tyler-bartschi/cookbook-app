export interface UserRow {
  readonly id: string;
  readonly type: "user";
  readonly username: string;
  readonly email: string;
  readonly hashed_password: string;
  readonly profile_picture_url: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface UsernameRow {
  readonly id: string;
  readonly type: "username_lookup";
  readonly user_id: string;
  readonly created_at: string;
}

export interface EmailRow {
  readonly id: string;
  readonly type: "email_lookup";
  readonly user_id: string;
  readonly created_at: string;
}
