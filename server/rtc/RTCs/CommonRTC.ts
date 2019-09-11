import {BasicRTC} from '../BasicRTC';
import {CommonHandler} from '../../handlers/user/CommonHandler';
import Handler from "../../handlers/user/CommonHandler"
import {OpenRTC} from "../OpenRTC";

export class CommonRTC extends BasicRTC {
  private _loggedUser;

  /**
   * Recebe o socketId passado pelo client.
   *
   * @param conf
   */
  constructor(conf, msg, openRTC) {
    super('common', Handler, conf);

    openRTC.destroy();
    this.interfaceListeners = {
      'logout': this.logout.bind(this),
    };
    this.loggedUser = msg.datas.data;
    this.sendToBrowser(msg);
    this.wiring();
  }

  set loggedUser(loggedUser) {
    this._loggedUser = loggedUser;
  }

  get loggedUser() {
    return this._loggedUser;
  }

  set handler(handler: CommonHandler) {
    this._handler = handler;
  }

  get handler(): CommonHandler {
    return this._handler;
  }

  set interfaceListeners(interfaceListeners: object) {
    this._interfaceListeners = interfaceListeners;
  }

  get interfaceListeners(): object {
    return this._interfaceListeners;
  }

  /**
   * Efetua o logout do cliente, matando o RTC dele.
   *
   * @param msg
   * @returns {Promise<void>}
   */
  async logout(msg) {
    msg.response = await this.handler.logout({userId: this.loggedUser.id});
    new OpenRTC(this.config);
    this.sendToBrowser(msg);
    this.destroy();
  }

}