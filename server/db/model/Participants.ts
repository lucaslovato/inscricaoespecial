import {Model as User} from "./User";
import {BaseSchema} from "../BaseSchema";
import {Schema, model} from "mongoose";

let schema_options = {
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  minimize: true,
  timestamps: true
  // http://mongoosejs.com/docs/guide.html#options
};

//noinspection SpellCheckingInspection,JSNonASCIINames
let schema = new Schema(Object.assign({
  birthdate: {
    type: Schema.Types.String,
    required: [true, "birthdateRequired"]
  },
  cpf: {
    type: Schema.Types.String,
    required: [true, "cpfRequired"],
    unique: true
  },
  rg: {
    type: Schema.Types.String,
    required: [true, "rgRequired"],
    unique: true,
  },
  reason: {
    type: Schema.Types.String,
    required: [true, "reasonRequired"],
  },
  phoneNumber: {
    type: Schema.Types.String,
    required: [true, "phoneNumberRequired"],
  },
  course: {
    type: Schema.Types.String,
    required: [true, "courseRequired"],
  },
  ies: {
    type: Schema.Types.String,
    required: [true, "iesRequired"],
  },
  subject: {
    type: Schema.Types.ObjectId,
    required: [true, "subjectRequired"],
  },
  document: {
    matrCertificate: {
      type: Schema.Types.String,
    },
    rgCpf: {
      type: Schema.Types.String,
    },
    passport: {
      type: Schema.Types.String,
    },
    visa: {
      type: Schema.Types.String,
    },
    lattes: {
      type: Schema.Types.String,
    },
    registrationCertificate: {
      type: Schema.Types.String
    }
  },
  isForeign: {
    type: Schema.Types.Boolean,
    default: false,
  },
  isAffiliated: {
    type: Schema.Types.Boolean,
    default: false,
  },
  passport: {
    type: Schema.Types.String,
    default: null,
  },
  subscription: {
    type: Schema.Types.ObjectId,
    required: [true, "subscriptionRequired"],
  },
  logged: {
    type: Schema.Types.Boolean,
    default: false,
  },
}, BaseSchema), schema_options);

let discriminated = User.discriminator("participant", schema);

let ParticipantModel = model("participant", discriminated.schema);
export {ParticipantModel as Model};