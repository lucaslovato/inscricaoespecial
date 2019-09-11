import {User} from "./User";
import {Model} from "../model/Participants";

export class Participant extends User {
  wire_custom_listeners() {
    super.wireCustomListeners();
  }

  get model() {
    return Model;
  }

  get eventName() {
    return 'participant';
  }
}