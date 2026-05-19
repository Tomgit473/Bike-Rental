import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: String,
    password: {
      type: String,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["renter", "owner", "admin"],
      default: "renter"
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    googleId: String,
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    otp: String,
    otpExpires: Date,
    aadhaar: {
      numberLast4: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    drivingLicense: {
      number: String,
      imageUrl: String,
      verified: {
        type: Boolean,
        default: false
      },
      expiresAt: Date
    },
    kycStatus: {
      type: String,
      enum: ["not_started", "pending", "approved", "rejected"],
      default: "not_started"
    },
    trustedScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70
    },
    walletBalance: {
      type: Number,
      default: 0
    },
    favoriteVehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle"
      }
    ],
    addresses: [addressSchema],
    emergencyContact: {
      name: String,
      phone: String
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

userSchema.index({ "addresses.location": "2dsphere" });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toAuthJSON = function toAuthJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    kycStatus: this.kycStatus,
    trustedScore: this.trustedScore,
    walletBalance: this.walletBalance,
    favoriteVehicles: this.favoriteVehicles
  };
};

export default mongoose.model("User", userSchema);
