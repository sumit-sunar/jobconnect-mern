import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        message: '{VALUE} is not a valid job type',
      },
    },
    category: {
      type: String,
      trim: true,
    },
    salaryMin: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    salaryMax: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['Entry', 'Mid', 'Senior', 'Lead'],
        message: '{VALUE} is not a valid experience level',
      },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer/User reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'closed'],
        message: '{VALUE} is not a valid job status',
      },
      default: 'open',
    },
    applicationDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality on title, company, location, and category
jobSchema.index({
  title: 'text',
  company: 'text',
  location: 'text',
  category: 'text',
});

// Single index for quick query filtering by category, jobType, and postedBy
jobSchema.index({ category: 1, jobType: 1 });
jobSchema.index({ postedBy: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
