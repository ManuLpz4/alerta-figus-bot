export default class Product {
  constructor(
    private _title: string,
    private _price: string,
    private _link: string
  ) { }

  public get title() {
    return this._title;
  }

  public get price() {
    return this._price;
  }

  public get link() {
    return this._link;
  }
}