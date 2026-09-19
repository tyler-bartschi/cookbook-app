interface Props {
  setUsernameOrEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  usernameOrEmailError: string;
  passwordError: string;
}

const AuthenticationFields = (props: Props) => {
  return (
    <>
      <div className="form-field">
        <label htmlFor="usernameOrEmailInput">Username or email</label>

        <input
          id="usernameOrEmailInput"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="Username or email"
          aria-invalid={Boolean(props.usernameOrEmailError)}
          aria-describedby={props.usernameOrEmailError ? "usernameOrEmailError" : undefined}
          onChange={(event) => props.setUsernameOrEmail(event.target.value)}
        />
        {props.usernameOrEmailError && (
          <div id="usernameOrEmailError" className="field-error">
            {props.usernameOrEmailError}
          </div>
        )}
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

        {props.passwordError && (
          <div id="passwordError" className="field-error">
            {props.passwordError}
          </div>
        )}
      </div>
    </>
  );
};

export default AuthenticationFields;
