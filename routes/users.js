var mongoose = require("mongoose")
var plm = require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/pinterest")

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    profileImage: String,
    boards: {
        type: Array,
        default: []
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
})

userSchema.plugin(plm)  // it provide extra methods to perform user authentication properly

module.exports = mongoose.model("User", userSchema)