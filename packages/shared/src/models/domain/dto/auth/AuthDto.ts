export interface AuthDto {
  // authToken in the form of tokenId.token
  readonly authToken: string;
  readonly userId: string;
}
