import mongoose from "mongoose";

const WindowSchema = new mongoose.Schema(
  {
    degree_title: {
      type: String,
      required: [true, "Please enter Degree Title"],
    },

    year: {
      type: Number,
      required: [true, "Please enter Year"],
    },

    semester: {
      type: Number,
      required: [true, "Please enter Semester"],
    },

    date: {
      type: Date,
      required: [true, "Please enter Date"],
    },

    start_time: {
      type: Date,  // stores full Date+Time
      required: [true, "Please enter Start Time"],
    },

    end_time: {
      type: Date,  // stores full Date+Time
      required: [true, "Please enter End Time"],
    },

    duration: {
      type: Number, // minutes or hours
      required: [true, "Please enter Duration"],
    },
  },
  {
    timestamps: true,
  }
);

const Window = mongoose.model("Window", WindowSchema);

export default Window;
