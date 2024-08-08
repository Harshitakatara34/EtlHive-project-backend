const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    required: true,
  },
  product: {
    type: String,
    enum: ["A", "B", "C"],
    required: true,
  },
});

module.exports = mongoose.model("Lead", LeadSchema);
