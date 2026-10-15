import { errorFunc, Presenter, View } from "../abstract/Presenter";

export interface RegisterView extends View {
  setIsLoading: (value: boolean) => void;
  setUsernameError: errorFunc;
  setEmailError: errorFunc;
  setPasswordError: errorFunc;
}

export class RegisterPresenter extends Presenter<RegisterView> {
  public constructor(view: RegisterView) {
    super(view);
  }

  public submitButtonStatus(username: string, email: string, password: string): boolean {
    return !username || !email || !password;
  }
}
