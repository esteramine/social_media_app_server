const { model, Schema } = require('mongoose');


//handle the required fields in graphql layer, so no need to specify in this schema
const userSchema = new Schema({
    username: String,
    email: String,
    password: String,
    createdAt: String
});

module.exports = model('User', userSchema);