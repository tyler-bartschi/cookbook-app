import { SubmitEventHandler, useState } from "react";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import "./Login.css";
import AuthenticationFields from "../AuthenticationFields";
import { Link } from "react-router-dom";

const Login = () => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameOrEmailError, setUsernameOrEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const submitButtonDisabled = () => {
    return !password || !userIdentifier;
  };

  const submit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setIsLoading(true);
    try {
      // do some logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };

  const inputFieldFactory = () => {
    return (
      <AuthenticationFields
        setUsernameOrEmail={setUserIdentifier}
        setPassword={setPassword}
        usernameOrEmailError={usernameOrEmailError}
        passwordError={passwordError}
      />
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div>
        Not registered? <Link className="authentication-link" to="/register">Register</Link>
      </div>
    );
  };

  return (
    <>
      <AuthenticationFormLayout
        headingText="Login to cookbook"
        inputFieldFactory={inputFieldFactory}
        isLoading={isLoading}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        submitButtonLabel="Login"
        submitButtonDisabled={submitButtonDisabled}
        submit={submit}
        switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      />
    </>
  );
};

export default Login;
