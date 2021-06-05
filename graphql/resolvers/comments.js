const { UserInputError, AuthenticationError } = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../util/checkAuth');

module.exports = {
    Mutation: {
        async createComment(_, { postId, body }, context){
            const { username } = checkAuth(context);
            if (body.trim() === ''){
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment field must not be empty'
                    }
                });
            }
            const post = await Post.findById(postId);

            if (post){
                post.comments.unshift({
                    body, 
                    username,
                    createdAt: new Date().toISOString()
                })
                await post.save();
                return post;
            } 
            else{
                throw new UserInputError('Post not found');
            }
        },
        async deleteComment(_, { postId, commentId }, context){
            const { username } = checkAuth(context);
            const post = await Post.findById(postId);
            if (post){
                const commentIndex = post.comments.findIndex(e => e.id === commentId);
                if (commentIndex!=-1 && post.comments[commentIndex].username === username){ //to prevent other user is also deleting comment and affect the comment index
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                }
                else{ // the owner of the comment is other person
                    throw new AuthenticationError('Action not allowed');
                }
            }
            else{
                throw new UserInputError('Post not found');
            }
            

        }
    }
}