import {Schema} from "mongoose";

let schema_options = {
  _id: false,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
};

let schema = new Schema({
  baseWeight: {
    type: Schema.Types.Number,
    required: [true, "baseWeightRequired"],
  },
  product: {
    type: Schema.Types.ObjectId,
    required: [true, "productRequired"],
    ref: "product",
  },
}, schema_options);

export {schema};