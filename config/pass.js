var LocalStrategy = require('passport-local').Strategy;


/**
 * This function provides our authentication logic
 * @param passport The passport authentication middleware
 */
module.exports = function(passport) {

    // Our user(s)
    var users = [
        { id:1, username: 'sean', password: 'spades' }
    ];


    /**
     * Passport function to find users by ID
     * @param id Users ID
     * @param fn callback
     */
    function findById(id, fn) {
        var idx = id - 1;
        if (users[idx]) {
            fn(null, users[idx]);
        } else {
            fn(new Error('User ' + id + ' does not exist'));
        }
    }


    /**
     * Passport function to find users by username
     * @param username The users username
     * @param fn callback
     * @returns {*} Returns callback
     */
    function findByUsername(username, fn) {
        for (var i = 0, len = users.length; i < len; i++) {
            var user = users[i];
            if (user.username === username) {
                return fn(null, user);
            }
        }
        return fn(null, null);
    }


    /**
     * In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request.
     * If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
     * Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session.
     * In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
     */
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        findById(id, function (err, user) {
            done(err, user);
        });
    });


    /**
     * Tell passport that we wan to use a "LocalStrategy" to authenticate users
     */
    passport.use(new LocalStrategy(function(username, password, done) {
            findByUsername(username, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Unknown user ' + username });
                }
                if (user.password != password) {
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, user);
            })
        }
    ));
};
