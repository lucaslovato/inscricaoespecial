import {User} from "./managers/User";
import {Admin} from './managers/Admin';
import {ManagerMap} from "../interfaces/ManagerMap";
import {Participant} from "./managers/Participant";
import {Subject} from "./managers/Subject";
import {Subscription} from "./managers/Subscription";
import {SubscriptionSubject} from "./managers/SubscriptionSubject";

/**
 * Inicia todos os managers.
 */
let Managers: ManagerMap = {
  "user": new User(),
  "admin": new Admin(),
  "participant": new Participant(),
  "subject": new Subject(),
  "subscription": new Subscription(),
  "subscription_subject": new SubscriptionSubject(),
};

export {Managers};