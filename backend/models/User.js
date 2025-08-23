import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// User roles enum
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// User status enum
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.STUDENT,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  passwordChangeOtp: {
    type: String,
    default: null
  },
  passwordChangeOtpExpires: {
    type: Date,
    default: null
  },
  passwordChangeOtpAttempts: {
    type: Number,
    default: 0
  },
  // Forgot password OTP fields
  forgotPasswordOtp: {
    type: String,
    default: null
  },
  forgotPasswordOtpExpires: {
    type: Date,
    default: null
  },
  forgotPasswordOtpAttempts: {
    type: Number,
    default: 0
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Student-specific fields
  studentId: {
    type: String,
    sparse: true, // Allow null but ensure uniqueness when present
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if user is a student and studentId is provided
        return this.role !== USER_ROLES.STUDENT || (v && v.length > 0);
      },
      message: 'Student ID is required for student accounts'
    }
  },
  enrollmentYear: {
    type: Number,
    validate: {
      validator: function(v) {
        // Only validate if user is a student
        return this.role !== USER_ROLES.STUDENT || (v && v >= 2000 && v <= new Date().getFullYear() + 4);
      },
      message: 'Enrollment year must be between 2000 and 4 years in the future'
    }
  },
  course: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if user is a student
        return this.role !== USER_ROLES.STUDENT || (v && v.length > 0);
      },
      message: 'Course is required for student accounts'
    }
  },
  
  // Lecturer-specific fields
  employeeId: {
    type: String,
    sparse: true, // Allow null but ensure uniqueness when present
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if user is a teacher and employeeId is provided
        return this.role !== USER_ROLES.TEACHER || (v && v.length > 0);
      },
      message: 'Employee ID is required for lecturer accounts'
    }
  },
  department: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if user is a teacher
        return this.role !== USER_ROLES.TEACHER || (v && v.length > 0);
      },
      message: 'Department is required for lecturer accounts'
    }
  },
  subjects: {
    type: [String],
    validate: {
      validator: function(v) {
        // Only validate if user is a teacher
        return this.role !== USER_ROLES.TEACHER || (v && v.length > 0);
      },
      message: 'At least one subject is required for lecturer accounts'
    }
  },
  
  // Common profile fields
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty/null values, but validate format if provided
        if (!v || v === '') return true;
        
        // Remove all non-digit characters except +
        const cleaned = v.replace(/[^\d+]/g, '');
        
        // Check if it matches valid phone number patterns
        // Allows: +1234567890, 1234567890, +94771234567, etc.
        return /^[\+]?[\d]{7,15}$/.test(cleaned);
      },
      message: 'Please enter a valid phone number (7-15 digits, optional country code with +)'
    }
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v < new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordChangeOtp;
      delete ret.forgotPasswordOtp;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password and clean phone number
userSchema.pre('save', async function(next) {
  // Clean phone number if provided
  if (this.phoneNumber && this.isModified('phoneNumber')) {
    // Remove all non-digit characters except +
    this.phoneNumber = this.phoneNumber.replace(/[^\d+]/g, '');
    // If empty after cleaning, set to undefined
    if (this.phoneNumber === '') {
      this.phoneNumber = undefined;
    }
  }
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have hit max attempts and it's not locked, lock the account
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to generate password change OTP
userSchema.methods.generatePasswordChangeOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  
  this.passwordChangeOtp = otp;
  this.passwordChangeOtpExpires = otpExpires;
  this.passwordChangeOtpAttempts = 0;
  
  return otp;
};

// Instance method to verify password change OTP
userSchema.methods.verifyPasswordChangeOtp = function(otp) {
  if (!this.passwordChangeOtp || !this.passwordChangeOtpExpires) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }
  
  if (this.passwordChangeOtpExpires < new Date()) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (this.passwordChangeOtpAttempts >= 3) {
    return { valid: false, message: 'Too many invalid attempts. Please request a new OTP.' };
  }
  
  if (this.passwordChangeOtp !== otp) {
    this.passwordChangeOtpAttempts += 1;
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }
  
  return { valid: true, message: 'OTP verified successfully.' };
};

// Instance method to clear password change OTP
userSchema.methods.clearPasswordChangeOtp = function() {
  this.passwordChangeOtp = undefined;
  this.passwordChangeOtpExpires = undefined;
  this.passwordChangeOtpAttempts = 0;
};

// Instance method to generate forgot password OTP
userSchema.methods.generateForgotPasswordOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  this.forgotPasswordOtp = otp;
  this.forgotPasswordOtpExpires = otpExpires;
  this.forgotPasswordOtpAttempts = 0;
  
  return otp;
};

// Instance method to verify forgot password OTP
userSchema.methods.verifyForgotPasswordOtp = function(otp) {
  if (!this.forgotPasswordOtp || !this.forgotPasswordOtpExpires) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }
  
  if (this.forgotPasswordOtpExpires < new Date()) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (this.forgotPasswordOtpAttempts >= 3) {
    return { valid: false, message: 'Too many invalid attempts. Please request a new OTP.' };
  }
  
  if (this.forgotPasswordOtp !== otp) {
    this.forgotPasswordOtpAttempts += 1;
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }
  
  return { valid: true, message: 'OTP verified successfully.' };
};

// Instance method to clear forgot password OTP
userSchema.methods.clearForgotPasswordOtp = function() {
  this.forgotPasswordOtp = undefined;
  this.forgotPasswordOtpExpires = undefined;
  this.forgotPasswordOtpAttempts = 0;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ status: USER_STATUS.ACTIVE });
};

// Index for performance (email index is already created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ studentId: 1 }, { sparse: true, unique: true });
userSchema.index({ employeeId: 1 }, { sparse: true, unique: true });
userSchema.index({ department: 1 });
userSchema.index({ course: 1 });
userSchema.index({ enrollmentYear: 1 });

const User = mongoose.model('User', userSchema);

export default User;
