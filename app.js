var express = require('express')
  , flash = require('connect-flash')
  , passport = require('passport')
  , routes = require('./routes')
  , torrents = require('./routes/torrentrestapi')
  , system = require('./routes/systemapi')
  , auth = require('./routes/auth')
  , http = require('http')
  , path = require('path');

var app = express();

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

require('./config/pass.js')(passport);

app.get('/', ensureAuthenticated, routes.index);
app.post('/add-torrent', ensureAuthenticated, system.addTorrent);
app.post('/add-torrent-url', ensureAuthenticated, system.addTorrentURL);
app.get('/torrents', ensureAuthenticated, torrents.getTorrents);
app.get('/files/:hash', ensureAuthenticated, torrents.getFileInfo);
app.get('/trackers/:hash', ensureAuthenticated, torrents.getTrackerInfo);
app.get('/info/:hash', ensureAuthenticated, torrents.getDetailedTorrentInfo);
app.get('/peers/:hash', ensureAuthenticated, torrents.getPeerInfo);
app.get('/stop/:hash', ensureAuthenticated, torrents.stopTorrent);
app.get('/start/:hash', ensureAuthenticated, torrents.startTorrent);
app.get('/stats', ensureAuthenticated, torrents.getStats);
app.get('/settings', ensureAuthenticated, system.getSettings);
app.post('/settings', ensureAuthenticated, system.setSettings);
app.get('/system-stats', ensureAuthenticated, system.getSystemStats);
app.get('/login', auth.login);
app.post('/login', passport.authenticate('local', { failureRedirect: '/login'}), function(req, res) {
    res.redirect('/');
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});
app.get('/partials/:name', ensureAuthenticated, function (req, res) {
    var name = req.params.name;
    res.render('../public/partials/' + name);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


function ensureAuthenticated(req, res, next) {
    if ('development' == app.get('env') || req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}