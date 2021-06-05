const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../util/checkAuth');

module.exports = {
    Query: {
        async getPosts(){
            try{
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            }catch(err){
                throw new Error(err);
            }
        },

        async getPost(_, { postId }){
            try{
                const post = await Post.findById(postId);
                if (post){
                    return post;
                }
                else{
                    throw new Error('Post not found');
                }
            }catch(err){
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context){
            const user = checkAuth(context);
            //if the server could reach here, it means the user is authenticated, and can create post
            if (body.trim() === ''){
                throw new Error('Post body must not be empty');
            }
            const newPost = new Post({
                user: user.id,
                body,
                username: user.username,
                createdAt: new Date().toISOString()
            });
            const post = await newPost.save();

            //subscription
            context.pubsub.publish('NEW_POST',{
                newPost: post
            });

            return post;

        },
        async deletePost(_, { postId }, context){
            const user = checkAuth(context);

            //only the user himself/herself can delete his/her post
            try{
                const post = await Post.findById(postId);
                if(post){
                    if (post.username === user.username){
                        await post.delete();
                        return 'Post deleted successfully!';
                    }
                    else{
                        throw new AuthenticationError('Action not allowed');
                    }
                }
                else{
                    throw new Error('Post not found');
                }
            }catch(err){
                throw new Error(err);
            }
        },
        async likePost(_, { postId }, context){
            const { username } = checkAuth(context);
            const post = await Post.findById(postId);
            if (post){
                if (post.likes.find(like => like.username === username)){
                    // meaning post is already liked by the same user, unlike it (toggle)
                    post.likes = post.likes.filter(like => like.username !== username);
                }
                else{ //the user has not liked the post -> like the post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    });    
                }
                await post.save();
                return post;
            }
            else{
                throw new UserInputError('Post not found');
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}