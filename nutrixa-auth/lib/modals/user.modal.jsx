const { Schema, model, models } = require("mongoose");

const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
  photo: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  weight: {
    type: Number,
    required: true,
  },
  diets: {
    type: [String],
    required: true,
  },
});

const User = models && models.User ? models.User : model("User", UserSchema);
module.exports = User;
