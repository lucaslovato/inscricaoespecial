import {Source} from '../events/Source';
import {OpenRest} from './apis/OpenRest';
import {AdminRest} from "./apis/AdminRest";
import {ParticipantRest} from "./apis/ParticipantRest";

export class InitRestful extends Source {
  private _restfulSet: object;

  constructor(router) {
    super();
    this.restfulSet = {
      open_rest: OpenRest,
      admin_rest: AdminRest,
      participant_rest: ParticipantRest
    };
    for (let restful in this.restfulSet) {
      if (this.restfulSet.hasOwnProperty(restful)) {
        new this.restfulSet[restful](router);
      }
    }
    process.nextTick(() => {
      this.hub.send(this, 'restful.ready', {success: null, error: null});
    });
  }

  set restfulSet(restful) {
    this._restfulSet = restful;
  }

  get restfulSet() {
    return this._restfulSet;
  }
}