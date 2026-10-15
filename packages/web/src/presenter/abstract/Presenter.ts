/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
export interface View {}

export type errorFunc = (error: string) => void;

export abstract class Presenter<V extends View> {
  private _view: V;

  protected constructor(view: V) {
    this._view = view;
  }

  protected get view(): V {
    return this._view;
  }
}
