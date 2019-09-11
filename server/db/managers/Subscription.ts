import {User} from "./User";
import {Model} from "../model/Subscription";

export class Subscription extends User {
  wire_custom_listeners() {
    super.wireCustomListeners();
  }

  get model() {
    return Model;
  }

  get eventName() {
    return 'subscription';
  }
}