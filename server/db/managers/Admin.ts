import {User} from "./User";
import {Model} from "../model/Admin";

export class Admin extends User {
  wire_custom_listeners() {
    super.wireCustomListeners();
  }

  get model() {
    return Model;
  }

  get eventName() {
    return 'admin';
  }
}