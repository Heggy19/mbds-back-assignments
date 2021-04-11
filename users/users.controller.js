const express = require('express');
const router = express.Router();
const userService = require('./user.service');
var bcrypt = require('bcryptjs');
var User = require('../model/User');
var jwt = require('jsonwebtoken');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('config.json');
// routes
router.post('/authenticate', authenticate);
router.get('/', getAll);
router.post('/register', register);

module.exports = router;

function authenticate(req, res, next) {
    /*userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);*/
    User.findOne({ name: req.body.username }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({ id: user.id, name: user.name, auth: true, token: token });
    });
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}
function register(req, res) {
    let user = new User();
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = hashedPassword;

    user.save((err) => {
        if (err) {
            console.log(err);
            res.status(404).json({ err });
        }
        res.json({ message: `saved!` });
    });
}
router.get('/logout', function(req, res) {
    res.status(200).send({ auth: false, token: null });
});
