
/**
 * Module dependencies.
 */

var express = require('express')
  , flash = require('connect-flash')
  , passport = require('passport')
  , routes = require('./routes')
  , torrents = require('./routes/torrentrestapi')
  , auth = require('./routes/auth')
  , http = require('http')
  , path = require('path')
  , LocalStrategy = require('passport-local').Strategy;

var users = [
    { id:1, username: 'sean', password: 'spades' }
];

function findById(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
        fn(null, users[idx]);
    } else {
        fn(new Error('User ' + id + ' does not exist'));
    }
}

function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});

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

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.session({ secret: 'omglol' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', ensureAuthenticated, function(req, res) {
    routes.index(req, res), { user: req.user }
});
app.get('/torrents', ensureAuthenticated, torrents.getTorrents);
app.get('/stats', ensureAuthenticated, torrents.getStats);
app.get('/login', auth.login);
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}