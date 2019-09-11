import * as HTTPStatus from 'http-status-codes';
import {BasicRest} from "../BasicRest";
import ParticipantHandler from "../../handlers/user/ParticipantHandler";
import {ParticipantHandler as Handler} from "../../handlers/user/ParticipantHandler";

export class ParticipantRest extends BasicRest {
  protected _handler: Handler;

  constructor(router) {
    super(router, ParticipantHandler);

    this.routes = {
      post: {
        '/open/createParticipant': this.createParticipant.bind(this),
        '/changeSub': this.changeSubject.bind(this),
        '/documentUpload': this.documentUpload.bind(this),
      },
      get: {}
      ,
    };
    this.wiring();
  }

  set handler(value: Handler) {
    this._handler = value;
  }

  get handler(): Handler{
    return this._handler;
  }

  set routes(rotas) {
    this._routes = rotas;
  }

  get routes() {
    return this._routes;
  }
  async createParticipant(req, res){
    let ret = await this.handler.participant_create(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }
  async changeSubject(req, res){
    let ret = await this.handler.change_subject(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data)
  }
  async documentUpload(req, res){
    let ret = await this.handler.document_update(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }
  async logout(req, res) {
    let ret = await this.handler.logout(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret);
  }
}