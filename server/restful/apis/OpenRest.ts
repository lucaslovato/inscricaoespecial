import {BasicRest} from "../BasicRest";
import {OpenHandler} from "../../handlers/user/OpenHandler";
import Handler from "../../handlers/user/OpenHandler";
import * as HTTPStatus from 'http-status-codes';

export class OpenRest extends BasicRest {
  protected _handler: OpenHandler;

  constructor(router) {
    super(router, Handler);

    this.routes = {
      post: {
        '/open/login': this.login.bind(this),
        '/open/logout': this.logout.bind(this),
      },
      get:{
        '/locale': this.getLocale.bind(this),
      },
    };

    this.wiring();
  }

  set handler(value: OpenHandler) {
    this._handler = value;
  }

  get handler(): OpenHandler {
    return this._handler;
  }

  set routes(rotas) {
    this._routes = rotas;
  }

  get routes() {
    return this._routes;
  }

  private async getLocale(req, res){
    let response = await this.handler.getLocale(req.query);
    res
      .status(HTTPStatus.OK)
      .send(response);
  }

  async login(req, res){
    let ret = await this.handler.login(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret);
  }
  async logout(req, res){
    let ret = await this.handler.logout(req.body.userId);
    res
      .status(HTTPStatus.OK)
      .send(ret);
  }
}