// Auth

export {
  RegisterRequestSchema,
  type RegisterRequest,
  type RegisterRequestWithImage,
  type RegisterRequestWithoutImage,
} from "./auth/RegisterRequest.js";
export {
  LoginRequestSchema,
  type LoginRequest,
  type UsernameLoginRequest,
  type EmailLoginRequest,
} from "./auth/LoginRequest.js";
export { LogoutRequestSchema, type LogoutRequest } from "./auth/LogoutRequest.js";
export {
  UpdatePasswordRequestSchema,
  type UpdatePasswordRequest,
} from "./auth/UpdatePasswordRequest.js";

// User

export { UpdateEmailRequestSchema, type UpdateEmailRequest } from "./user/UpdateEmailRequest.js";
export {
  UpdateProfilePictureRequestSchema,
  type UpdateProfilePictureRequest,
} from "./user/UpdateProfilePictureRequest.js";
export {
  UpdateUsernameRequestSchema,
  type UpdateUsernameRequest,
} from "./user/UpdateUsernameRequest.js";
