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

export enum SubscriptionStatus {
  CREATED,
  RUNNING,
  FINISHED
}

//noinspection SpellCheckingInspection,JSNonASCIINames
let schema = new Schema(Object.assign({
  status:{
    type: Schema.Types.Number,
    required: true,
    index: true,
    validate: {
      validator: function (value) {
        return !!SubscriptionStatus[value];
      },
      message: "Invalid Status"
    },
    default: SubscriptionStatus.CREATED
  },
  initDate: {
    type: Schema.Types.Date,
    required: [true, "initDateRequired"],

  },
  endDate: {
    type: Schema.Types.Date,
    required: [true, "endDateRequired"]
  },
  subjects: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'subscription_subject'
    }],
    default: []
  },
}, BaseSchema), schema_options);

let SubscriptionModel = model("subscription", schema);
export {SubscriptionModel as Model};
