import * as HTTPStatus from 'http-status-codes';
import {BasicRest} from "../BasicRest";
import {AdminHandler as Handler} from "../../handlers/user/AdminHandler"
import AdminHandler from "../../handlers/user/AdminHandler";

export class AdminRest extends BasicRest {
  protected _handler: Handler;

  constructor(router) {
    super(router, AdminHandler);

    this.routes = {
      post: {
        '/logout': this.logout.bind(this),
        '/createSubject': this.createSubject.bind(this),
        '/updateSubject': this.updateSubject.bind(this),
        '/removeSubject': this.removeSubject.bind(this),
        '/readSubject': this.readSubject.bind(this),
        '/createSubscription': this.createSubscription.bind(this),
        '/updateSubscription': this.updateSubscription.bind(this),
        '/subscriptionRead': this.subscriptionRead.bind(this),
        '/subscriptionRemove': this.subscriptionRemove.bind(this),
        '/subscriberRead': this.subscriberRead.bind(this),
        '/startSubscription': this.startSubscription.bind(this),
      },
      get: {
        '/open/downloadPartDoc/:id/:participantId': this.downloadPartDoc.bind(this),
        '/open/downloadSubjectDocs/:id/:subscriptionSubject': this.downloadSubjectDocs.bind(this),
        '/open/genSubjectExcel/:id/:subscriptionSubject': this.genSubjectExcel.bind(this),
      },
    };
    this.wiring();
  }

  set handler(value: Handler) {
    this._handler = value;
  }

  get handler(): Handler {
    return this._handler;
  }

  set routes(rotas) {
    this._routes = rotas;
  }

  get routes() {
    return this._routes;
  }

  async logout(req, res) {
    let ret = await this.handler.logout(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret);
  }

  async createSubject(req, res) {
    let ret = await this.handler.create_subject(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async updateSubject(req, res) {
    let ret = await this.handler.update_subject(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async removeSubject(req, res) {
    let ret = await this.handler.remove_subject(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data)
  }

  async readSubject(req, res) {
    let ret = await this.handler.read_subject(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async createSubscription(req, res) {
    let ret = await this.handler.create_subscription(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async updateSubscription(req, res) {
    let ret = await this.handler.update_subscription(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async subscriptionRead(req, res) {
    let ret = await this.handler.subscription_read(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async subscriptionRemove(req, res) {
    let ret = await this.handler.remove_subscription(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data)
  }

  async subscriberRead(req, res) {
    let ret = await this.handler.subcriber_read(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async downloadPartDoc(req, res) {
    let ret = await this.handler.donwload_part_docs(req.params);
    res
      .status(HTTPStatus.OK)
      .zip(ret.data)
  }

  async startSubscription(req, res) {
    let ret = await this.handler.init_subscription(req.body);
    res
      .status(HTTPStatus.OK)
      .send(ret.data);
  }

  async downloadSubjectDocs(req, res) {
    let ret = await this.handler.download_subject_docs(req.params);
    res
      .status(HTTPStatus.OK)
      .zip(ret);
  }
  async genSubjectExcel(req, res){
    let ret = await this.handler.gen_subject_excel(req.params);
    let day = new Date();
    if (ret.success) {
      res
        .status(HTTPStatus.OK)
        //.send({success: true, description: "excel gerado com sucesso"})
        .xls(`Disiciplina ${ret.data.subjectName}` + '_' + day.getDate() + '_' + day.getMonth() + '_' + day.getFullYear() + '.xlsx', ret.data.xls);
    }
    else {
      res
        .status(HTTPStatus.INTERNAL_SERVER_ERROR)
        .send(ret.data);
    }
  }
}