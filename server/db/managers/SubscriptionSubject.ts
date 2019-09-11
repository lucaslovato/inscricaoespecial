import {User} from "./User";
import {Model} from "../model/SubscriptionSubject";

export class SubscriptionSubject extends User {
  wire_custom_listeners() {
    super.wireCustomListeners();
  }

  get model() {
    return Model;
  }

  get eventName() {
    return 'subscription_subject';
  }
}