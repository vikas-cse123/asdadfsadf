import mongoose from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    customerPhoneNumber: {
      type: String,
    },
    businessPhoneNumber: {
      type: String,
    },
    businessPhoneNumberId: {
      type: String,
    },
    ctwaClid: {
      type: String,
    },
    name: {
      type: String,
    },
    // true once the lead event has been sent to Meta; prevents duplicate sends
    isClidSend: {
      type: Boolean,
      default: false,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

// One clid should only ever be stored once. sparse = docs without a clid don't collide.
dataSchema.index({ ctwaClid: 1 }, { unique: true, sparse: true });

const Data = mongoose.model("data", dataSchema);
export default Data;