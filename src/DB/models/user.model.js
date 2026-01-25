import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    date_of_birth: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", ""],
      default: "",
    },
    image: {
      type: String,
      default: null,
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    customer_id: {
      type: String,
      required: true,
    },
    stripe_payment_methods: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    otp_code: {
      type: String,
      default: null,
      select: false,
    },
    otp_expires_at: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.otp_code;
        delete ret.otp_expires_at;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, +process.env.SALT);
  next();
});

const UserModel = mongoose.model("tbl_users", userSchema);

export default UserModel;
