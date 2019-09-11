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
  state: {
    type: Schema.Types.ObjectId,
    required: [true, "addressRequired.stateRequired"],
    ref: "state"
  },
  city: {
    type: Schema.Types.ObjectId,
    required: [true, "addressRequired.cityRequired"],
    ref: "city"
  },
  neighborhood: {
    type: Schema.Types.ObjectId,
    required: [true, "addressRequired.neighborhoodRequired"],
    ref: "neighborhood"
  },
  street: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "addressRequired.streetRequired"],
  },
  postalCode: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "addressRequired.postalCodeRequired"],
  },
  number: {
    type: Schema.Types.Number,
  },
  coord: {
    type: [Schema.Types.Number],
    index: "2dsphere",
    default: [],
  }
}, schema_options);

export {schema};