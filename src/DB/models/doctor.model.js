import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    about: { type: String, required: true },
    specialty: { type: String, required: true },
    available_slots: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    address: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    experience: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    patients: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    gender: { type: String, enum: ["male", "female"], required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.is_favourite = ret.is_favourite || false;
        return ret;
      },
    },
  }
);

// Virtual for is_favourite (can be set from outside)
doctorSchema.virtual("is_favourite").get(function () {
  return this._is_favourite || false;
});

doctorSchema.virtual("is_favourite").set(function (value) {
  this._is_favourite = value;
});

const DoctorModel = mongoose.model("tbl_doctors", doctorSchema);

export default DoctorModel;
