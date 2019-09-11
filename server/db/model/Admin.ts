import {Model as User} from "./User";
import {BaseSchema} from "../BaseSchema";
import {Schema, model} from "mongoose";

let schema_options = {
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
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
let schema = new Schema(Object.assign({}, BaseSchema), schema_options);

let discriminated = User.discriminator("admin", schema);

let AdminModel = model("admin", discriminated.schema);
export {AdminModel as Model};