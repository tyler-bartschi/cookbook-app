import { SubmitEventHandler, useState } from "react";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import "./Login.css";
import AuthenticationFields from "../AuthenticationFields";
import { Link } from "react-router-dom";
import { LoginPresenter, LoginView } from "../../presenter/authentication/LoginPresenter";

interface Props {
  previousUrl?: string;
}

const Login = (props: Props) => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameOrEmailError, setUsernameOrEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const listener: LoginView = {
    setIsLoading,
    setUsernameOrEmailError,
    setPasswordError,
  };

  const [presenter] = useState(() => new LoginPresenter(listener));

  const submitButtonDisabled = () => {
    return presenter.submitButtonStatus(userIdentifier, password);
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
        Not registered?{" "}
        <Link className="authentication-link" to="/register">
          Register
        </Link>
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
