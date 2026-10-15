import { errorFunc, Presenter, View } from "../abstract/Presenter";

export interface LoginView extends View {
  setIsLoading: (value: boolean) => void;
  setUsernameOrEmailError: errorFunc;
  setPasswordError: errorFunc;
}

export class LoginPresenter extends Presenter<LoginView> {
  public constructor(view: LoginView) {
    super(view);
  }

  public submitButtonStatus(identifier: string, password: string): boolean {
    return !identifier || !password;
  }
}
