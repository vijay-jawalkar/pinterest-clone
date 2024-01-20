var mongoose = require("mongoose")

const passwordResetSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true
    }
   
})



module.exports = mongoose.model("PasswordReset", passwordResetSchema)