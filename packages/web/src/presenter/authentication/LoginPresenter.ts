import { Presenter, View } from "../abstract/Presenter";

export interface LoginView extends View {
  setIsLoading: (value: boolean) => void;
  setUsernameOrEmailError: (error: string) => void;
  setPasswordError: (error: string) => void;
}

export class LoginPresenter extends Presenter<LoginView> {
  public constructor(view: LoginView) {
    super(view);
  }

  public submitButtonStatus(identifier: string, password: string): boolean {
    return !identifier || !password;
  }
}
