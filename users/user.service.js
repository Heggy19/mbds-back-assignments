const config = require('config.json');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var User = require('../model/user');
// users hardcoded for simplicity, store in a db for production applications
const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];

module.exports = {
    authenticate,
    getAll,
    register
};

async function authenticate({ username, password }) {
    console.log(username)
    const user = User.find(u => u.name === username && u.password === password);

    if (!user) throw 'Username or password is incorrect';

    // create a jwt token that is valid for 7 days
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });

    return {
        ...omitPassword(user),
        token
    };
}

async function getAll() {
    return users.map(u => omitPassword(u));
}

async function register({ username, email, password }) {
    var hashedPassword = bcrypt.hashSync(password, 8);
    User.create({
        name : username,
        email : email,
        password : hashedPassword
    })

}

// helper functions

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
