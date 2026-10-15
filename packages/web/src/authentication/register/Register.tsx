import { SubmitEventHandler, useState } from "react";
import "./Register.css";
import { Link } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import FieldError from "../FieldError";
import AuthenticationFields from "../AuthenticationFields";
import { RegisterPresenter, RegisterView } from "../../presenter/authentication/RegisterPresenter";

interface Props {
  previousUrl?: string;
}

const Register = () => {
  // username, email, password, remember me, image
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // profile picture upload handled later

  const listener: RegisterView = {
    setIsLoading,
    setUsernameError,
    setEmailError,
    setPasswordError,
  };

  const [presenter] = useState(() => new RegisterPresenter(listener));

  const submitButtonDisabled = () => {
    return presenter.submitButtonStatus(username, email, password);
  };

  const submit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    try {
      // register logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  const inputFieldFactory = () => {
    return (
      <>
        <div className="form-field">
          <label htmlFor="usernameInput">Username</label>
          <input
            id="usernameInput"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            aria-invalid={Boolean(usernameError)}
            aria-describedby={usernameError ? "usernameError" : undefined}
            onChange={(event) => setUsername(event.target.value)}
          />
          <FieldError id="usernameError" errorSource={usernameError} />
        </div>

        <AuthenticationFields
          setUsernameOrEmail={setEmail}
          setPassword={setPassword}
          usernameOrEmailError={emailError}
          passwordError={passwordError}
          usernameOrEmailLabel="Email"
          usernameOrEmailPlaceholder="Email"
          usernameOrEmailAutoCompleteType="email"
        />
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div>
        Already have an account?{" "}
        <Link className="authentication-link" to="/login">
          Login
        </Link>
      </div>
    );
  };

  return (
    <>
      <AuthenticationFormLayout
        headingText="Register for cookbook"
        inputFieldFactory={inputFieldFactory}
        isLoading={isLoading}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        submitButtonLabel="Register"
        submitButtonDisabled={submitButtonDisabled}
        submit={submit}
        switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      />
    </>
  );
};

export default Register;
