import FieldError from "./FieldError";

interface Props {
  setUsernameOrEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  usernameOrEmailError: string;
  passwordError: string;
  usernameOrEmailLabel: string;
  usernameOrEmailPlaceholder: string;
  usernameOrEmailAutoCompleteType: string;
}

const AuthenticationFields = (props: Props) => {
  return (
    <>
      <div className="form-field">
        <label htmlFor="usernameOrEmailInput">{props.usernameOrEmailLabel}</label>
        <input
          id="usernameOrEmailInput"
          name={props.usernameOrEmailLabel}
          type="text"
          autoComplete={props.usernameOrEmailAutoCompleteType}
          placeholder={props.usernameOrEmailPlaceholder}
          aria-invalid={Boolean(props.usernameOrEmailError)}
          aria-describedby={props.usernameOrEmailError ? "usernameOrEmailError" : undefined}
          onChange={(event) => props.setUsernameOrEmail(event.target.value)}
        />
        <FieldError id="usernameOrEmailError" errorSource={props.usernameOrEmailError} />
      </div>

      <div className="form-field">
        <label htmlFor="passwordInput">Password</label>
        <input
          id="passwordInput"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-invalid={Boolean(props.passwordError)}
          aria-describedby={props.passwordError ? "passwordError" : undefined}
          onChange={(event) => props.setPassword(event.target.value)}
        />
        <FieldError id="passwordError" errorSource={props.passwordError} />
      </div>
    </>
  );
};

export default AuthenticationFields;
