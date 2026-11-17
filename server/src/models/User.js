import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['jobseeker', 'employer', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'jobseeker',
    },
    profile: {
      headline: {
        type: String,
        trim: true,
      },
      bio: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      skills: {
        type: [String],
        default: [],
      },
      resumeUrl: {
        type: String,
        trim: true,
      },
      // Employer-specific profile fields
      companyName: {
        type: String,
        trim: true,
      },
      companyWebsite: {
        type: String,
        trim: true,
      },
      companyLogo: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password with bcryptjs before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method: Compare candidate password with hashed password in database
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// toJSON transform: remove password and __v from serialized JSON output
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
