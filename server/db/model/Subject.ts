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
let schema = new Schema(Object.assign({
  name: {
    type: Schema.Types.String,
    required: [true, "nameRequired"]
  }
}, BaseSchema), schema_options);

let SubjectModel = model("subject", schema);
export {SubjectModel as Model};