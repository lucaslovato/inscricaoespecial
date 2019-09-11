import {BasicRTC} from '../BasicRTC';
import Handler from '../../handlers/user/AdminHandler';
import {AdminHandler} from '../../handlers/user/AdminHandler';
import {OpenRTC} from '../OpenRTC';

export class AdminRTC extends BasicRTC {
  private _loggedUser;

  /**
   * Recebe o socketId passado pelo client.
   *
   * @param conf
   * @param msg
   * @param openRTC
   */
  constructor(conf, msg, openRTC) {
    super('admin', Handler, conf);
    openRTC.destroy();
    this.interfaceListeners = {
      'logout': this.logout.bind(this),
    };
    this.loggedUser = msg.response.data;
    this.sendToBrowser(msg);
    this.wiring();
  }

  private set loggedUser(loggedUser) {
    this._loggedUser = loggedUser;
  }

  private get loggedUser() {
    return this._loggedUser;
  }

  set handler(handler: AdminHandler) {
    this._handler = handler;
  }

  get handler(): AdminHandler {
    return this._handler;
  }

  set interfaceListeners(interfaceListeners: object) {
    this._interfaceListeners = interfaceListeners;
  }

  get interfaceListeners(): object {
    return this._interfaceListeners;
  }

  private async logout(msg) {
    msg.response = await this.handler.logout({userId: this.loggedUser.id});
    new OpenRTC(this.config);
    this.sendToBrowser(msg);
    this.destroy();
  }

}
