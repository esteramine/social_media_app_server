const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
require('dotenv-defaults').config()

const SECRET_KEY = process.env.SECRET_KEY;
const User = require('../../models/User');
const { validateRegisterInput, validateLoginInput } = require('../../util/validators');

const generateToken = (user)=>{
    return jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Mutation: {
        async login(_, { username, password }){
            const { valid, errors } = validateLoginInput(username, password);
            if (!valid){
                throw new UserInputError('Errors', { errors });
            }
            
            const user = await User.findOne({ username });

            if (!user){
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match){
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });

            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },
        async register(_, { registerInput: { username, email, password, confirmPassword } }){ //args <- registerinput
            // Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if (!valid){
                throw new UserInputError('Errors', { errors });
            }
            // Make sure user does not exist
            const user = await User.findOne({ username });
            if (user){
                throw new UserInputError('Username is taken',{
                    errors: {
                        username: 'This username is taken'
                    }
                });
            }
            //hash password and create an auth token
            password = await bcrypt.hash(password, 10);
            
            const newUser = new User({
                username, 
                email,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}