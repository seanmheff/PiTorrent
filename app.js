var express = require('express')
  , flash = require('connect-flash')
  , passport = require('passport')
  , http = require('http')
  , rtorrentAPI = require('./code/rtorrent/rtorrentapi.js');

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
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
else {
    // Start the daemon
    rtorrentAPI.rtorrentDaemon.start();

    process.on("uncaughtException", function() {
        rtorrentAPI.rtorrentDaemon.stop;
        process.exit(1);
    });
    process.on("SIGINT",  function() {
        rtorrentAPI.rtorrentDaemon.stop;
        process.exit(0);
    });
    process.on("SIGTERM",  function() {
        rtorrentAPI.rtorrentDaemon.stop;
        process.exit(0);
    });
}


// Set up our authentication middleware and routes
require('./config/pass.js')(passport);
require('./config/routes.js')(app, passport, express);


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});