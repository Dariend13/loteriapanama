const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// Estrategia Local (para el inicio de sesión)
passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user || !(await user.comparePassword(password))) {
                return done(null, false, { message: 'Invalid username or password' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

const opts = {
    jwtFromRequest: req => {
        // Extrayendo el token del encabezado Authorization
        let token = null;
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            token = req.headers.authorization.split(' ')[1];
        }
        return token;
    },
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

module.exports = passport;
