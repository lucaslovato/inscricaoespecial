import {BasicRTC} from './BasicRTC';
import {OpenHandler} from '../handlers/user/OpenHandler';
import Handler from '../handlers/user/OpenHandler';
import {AdminRTC} from './RTCs/AdminRTC';
import {CommonRTC} from './RTCs/CommonRTC';

export class OpenRTC extends BasicRTC {
  protected _userRTCs: BasicRTC;

  /**
   * Recebe o socketId passado pelo Client.
   *
   * @param conf
   */
  constructor(conf) {
    super('login', Handler, conf);
    this.userRTCs = {
      'admin': AdminRTC,
      'common': CommonRTC,
    };
    this.interfaceListeners = {
      'login': this.login.bind(this),
    };
    this.wiring();
  }

  set handler(handler: OpenHandler) {
    this._handler = handler;
  }

  get handler(): OpenHandler {
    return this._handler;
  }

  set interfaceListeners(interfaceListeners: object) {
    this._interfaceListeners = interfaceListeners;
  }

  get interfaceListeners(): object {
    return this._interfaceListeners;
  }

  set userRTCs(userRTCs: any) {
    this._userRTCs = userRTCs;
  }

  get userRTCs(): any {
    return this._userRTCs;
  }

  /**
   * Repassa o Order de login do Client.
   * @param msg
   * @returns {Promise.<void>}
   */
  async login(msg) {
    msg.response = await this.handler.login(msg.request);
    if (msg.response.success) {
      return this.changeRTC(msg);
    }
    this.sendToBrowser(msg);
  }

  /**
   * Responsavel por criar o rtc para o tipo de Employee.
   * @param msg
   */
  private changeRTC(msg) {
    let typeRTC = msg.response.data.type;
    new this.userRTCs[typeRTC](this.config, msg, this);
  }
}