const { ApolloServer, PubSub } = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');

const { MONGODB } = require('./config');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/typeDefs');

const pubsub = new PubSub();

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) =>({ req, pubsub })
});

mongoose
    .connect(MONGODB, { useNewUrlParser: true,  useUnifiedTopology: true })
    .then(()=> {
        console.log('MongoDB Connected!');
        return server.listen({ port: PORT });
    })
    .then(res=>{
        console.log(`Server listening at ${res.url}`);
    })
    .catch(err => {
       console.error(err); 
    });