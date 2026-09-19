import { JSX, SubmitEventHandler } from "react";
import { LoaderCircle } from "lucide-react";
import "./Authentication.css";

interface Props {
  headingText: string;
  submitButtonLabel: string;
  inputFieldFactory: () => JSX.Element;
  switchAuthenticationMethodFactory: () => JSX.Element;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  submitButtonDisabled: () => boolean;
  isLoading: boolean;
  submit: SubmitEventHandler<HTMLFormElement>;
}

const AuthenticationFormLayout = (props: Props) => {
  return (
    <>
      <div>
        <form className="authentication-form-wrapper" onSubmit={props.submit}>
          <img className="authentication-icon" src="/cookbook-icon-v1.png" />
          <h1 className="authentication-header">{props.headingText}</h1>

          {props.inputFieldFactory()}
          <div className="remember-me-checkbox">
            <label>
              <input
                type="checkbox"
                value="remember-me"
                checked={props.rememberMe}
                onChange={(event) => props.setRememberMe(event.target.checked)}
              />
              Remember me
            </label>
          </div>

          <div className="switch-authentication-method">
            {props.switchAuthenticationMethodFactory()}
          </div>

          <button
            id="submitButton"
            className="authentication-form-submit"
            type="submit"
            disabled={props.isLoading || props.submitButtonDisabled()}
            aria-busy={props.isLoading}
          >
            {props.isLoading && (
              <LoaderCircle className="authentication-submit-spinner" aria-hidden="true" />
            )}

            <span>{props.isLoading ? "Logging in..." : props.submitButtonLabel}</span>
          </button>
        </form>
      </div>
    </>
  );
};

export default AuthenticationFormLayout;
