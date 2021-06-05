const postResolvers = require('./posts');
const userResolvers = require('./users');
const commentResolvers = require('./comments');
const { Subscription } = require('./posts');

module.exports = {
    Post: { //every time after query, mutation, subscription need to return Post, they will go through this modifier and add the below properties
        likeCount: (parent)=>parent.likes.length,
        commentCount: (parent)=> parent.comments.length   
    },
    Query: {
        ...postResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...commentResolvers.Mutation
    },
    Subscription: {
        ...postResolvers.Subscription
    }
}