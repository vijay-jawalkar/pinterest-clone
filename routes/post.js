var mongoose = require("mongoose")


mongoose.connect("mongodb://127.0.0.1:27017/pinterest")

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    postImage: String,
    title: String,
    description: String,
})

module.exports = mongoose.model("Post", postSchema)
