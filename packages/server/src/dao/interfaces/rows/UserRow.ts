export interface UserRow {
  readonly pk: string; // USERID#${userId}
  readonly type: "user";
  readonly username: string;
  readonly email: string;
  readonly hashed_password: string;
  readonly profile_picture_url: string;
  readonly created_at: string; // stored as ISO string
  readonly updated_at: string; // stored as ISO string
}

export interface UsernameRow {
  readonly pk: string; // USERNAME#${username}
  readonly type: "username_lookup";
  readonly user_id: string;
  readonly created_at: string; // stored as ISO string
}

export interface EmailRow {
  readonly pk: string; // EMAIL#${email}
  readonly type: "email_lookup";
  readonly user_id: string;
  readonly created_at: string; // stored as ISO string
}
