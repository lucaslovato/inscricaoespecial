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
  subject: {
    type: Schema.Types.ObjectId,
    ref: "subject"
  },
  subscriber: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "participant"
    }]
  }
}, BaseSchema), schema_options);

let SubscriptionSubjectModel = model("subscription_subject", schema);
export {SubscriptionSubjectModel as Model};