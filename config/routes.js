var routes = require('../routes/general');
var torrents = require('../routes/torrentrestapi');
var system = require('../routes/systemapi');
var flow = require('./flow-node.js')('/home/sean/Desktop/Torrents/');
var formidable = require('formidable');


/**
 * This function defines the routes in our application
 * @param app The express app
 * @param passport The passport authentication middleware
 */
module.exports = function(app, passport) {

    /**
     * View routes - routes that render or deal with views
     */
    app.get('/', ensureAuthenticated, routes.index);
    app.get('/login', routes.login);
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
    app.get('/partials/detailed_info_widgets/:name', ensureAuthenticated, function (req, res) {
        var name = req.params.name;
        res.render('../public/partials/detailed_info_widgets/' + name);
    });
    app.post('/settings', ensureAuthenticated, system.setSettings);


    // Handle uploads through Flow.js
    app.post('/upload', function(req, res){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            req.body = fields;
            req.files = files;

            flow.post(req, function(status, filename, original_filename, identifier) {

                if (status === "done") {

                }
                console.log('POST', status, original_filename, identifier);
                res.send(200, {
                    // NOTE: Uncomment this funciton to enable cross-domain request.
                    //'Access-Control-Allow-Origin': '*'
                });
            });
        });
    });


    // Handle status checks on chunks through Flow.js
    app.get('/upload', function(req, res){
        //console.log(req.params);
        flow.get(req, function(status, filename, original_filename, identifier) {
            console.log('GET', status);
            res.send(200, (status == 'found' ? 200 : 404));
        });
    });

    app.get('/download/:identifier', function(req, res){
        flow.write(req.params.identifier, res);
    });


    /**
     * RESTful services routes - routes that define RESTful API's
     */
    app.post('/add-torrent', ensureAuthenticated, system.addTorrent);
    app.post('/add-torrent-url', ensureAuthenticated, system.addTorrentURL);
    app.get('/torrents', ensureAuthenticated, torrents.getTorrents);
    app.get('/files/:hash', ensureAuthenticated, torrents.getFileInfo);
    app.get('/trackers/:hash', ensureAuthenticated, torrents.getTrackerInfo);
    app.get('/info/:hash', ensureAuthenticated, torrents.getDetailedTorrentInfo);
    app.get('/peers/:hash', ensureAuthenticated, torrents.getPeerInfo);
    app.get('/stop/:hash', ensureAuthenticated, torrents.stopTorrent);
    app.get('/start/:hash', ensureAuthenticated, torrents.startTorrent);
    app.get('/remove/:hash', ensureAuthenticated, torrents.removeTorrent);
    app.get('/stats', ensureAuthenticated, torrents.getStats);
    app.get('/settings', ensureAuthenticated, system.getSettings);
    app.get('/system-stats', ensureAuthenticated, system.getSystemStats);
    app.get('/set-down-throttle/:speed', ensureAuthenticated, torrents.setDownThrottle);


    /**
     * A function to ensure users are authenticated to view specific routes
     * @param req The HTTP request
     * @param res The HTTP response
     * @param next The 'next' callback to run if the user is authenticated
     */
    function ensureAuthenticated(req, res, next) {
        if ('development' == app.get('env') || req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login')
    }
};