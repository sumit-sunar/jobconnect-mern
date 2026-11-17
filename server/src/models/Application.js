import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same job by the same applicant
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Index for fetching applications by applicant or by job
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ job: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
