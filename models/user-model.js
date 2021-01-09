const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema for a user
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", userSchema);

module.exports = User;