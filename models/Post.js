const { model, Schema } = require('mongoose');


//handle the required fields in graphql layer, so no need to specify in this schema
const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    body: String,
    username: String,
    createdAt: String,
    comments: [
        {
            body: String,
            username: String,
            createdAt: String
        }
    ],
    likes: [
        {
            username: String,
            createdAt: String
        }
    ]
});

module.exports = model('Post', postSchema);