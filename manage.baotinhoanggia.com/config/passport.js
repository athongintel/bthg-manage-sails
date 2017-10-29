const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TotpStrategy = require('passport-totp').Strategy;
const bcrypt = require('bcrypt');
const base32 = require('thirty-two');

const crypto = require('../utils/crypto');

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    _app.model.User.findOne({_id: id}, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    function (username, password, done) {
        _app.model.Auth.findOne({authMethod: _app.model.Auth.constants.AUTH_EMAIL, extra1: email})
            .then(authMethod => {
                if (!authMethod)
                    return done(null, false);
                
                let passWithSalt = `${password}${authMethod.extra3}`;
                return bcrypt.compare(passWithSalt, authMethod.extra2)
                    .then(result => {
                        if (result) return done(null, authMethod);
                        return done(null, false);
                    })
                    .catch(err => done(err))
            });
    }
));

passport.use(new TotpStrategy(
    function (user, done) {
        _app.model.User
            .findById(user._id)
            .select('gaSecret')
            .then(doc => {
                let key = crypto.decrypt(doc.gaSecret, user.password);
                return done(null, base32.decode(key), 30);
            })
            .catch(err => done(err));
    })
);
