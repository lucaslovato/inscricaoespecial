import {model, Schema} from "mongoose";
import {BaseSchema} from "../BaseSchema";

let schema_options = {
  discriminatorKey: "type",
  timestamps: true,
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
  }
  // http://mongoosejs.com/docs/guide.html#options
};

let schema = new Schema(Object.assign({
  name: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "nameRequired"]
  },
  surname: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "surnameRequired"]
  },
  email: {
    type: Schema.Types.String,
    required: [true, "emailRequired"],
    unique: true,
  },
  password: {
    type: Schema.Types.String,
    required: [true, "passwordRequired"],
  },
  logged: {
    type: Schema.Types.Boolean,
    default: false,
  },
}, BaseSchema), schema_options);

let UserModel = model("user", schema);
export {UserModel as Model};