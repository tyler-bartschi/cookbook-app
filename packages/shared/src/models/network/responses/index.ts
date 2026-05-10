// Auth

export { RegisterResponseSchema, type RegisterResponse } from "./auth/RegisterResponse.js";
export { LoginResponseSchema, type LoginResponse } from "./auth/LoginResponse.js";
export {
  ChangePasswordResponseSchema,
  type ChangePasswordResponse,
} from "./auth/ChangePasswordResponse.js";

// User

export {
  GetPublicUserResponseSchema,
  type GetPublicUserResponse,
} from "./user/GetPublicUserResponse.js";
export { GetUserResponseSchema, type GetUserResponse } from "./user/GetUserResponse.js";
export { UpdateEmailResponseSchema, type UpdateEmailResponse } from "./user/UpdateEmailResponse.js";
export {
  UpdateProfilePictureResponseSchema,
  type UpdateProfilePictureResponse,
} from "./user/UpdateProfilePictureResponse.js";
export {
  UpdateUsernameResponseSchema,
  type UpdateUsernameResponse,
} from "./user/UpdateUsernameResponse.js";
