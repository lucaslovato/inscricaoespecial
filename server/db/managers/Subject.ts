import {Model} from "../model/Subject";
import {BasicManager} from "../BasicManager";

export class Subject extends BasicManager{

  wireCustomListeners(){};

  get model() {
    return Model;
  }

  get eventName() {
    return 'subject';
  }
}