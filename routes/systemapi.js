module.exports = {
    getSystemStats:getSystemStats
}

var systemcontroller = require('../controllers/systemcontroller.js');


/**
 * A function to get system stats
 * @param req The HTTP request
 * @param res The HTTP response
 */
function getSystemStats(req, res) {
    systemcontroller.getSystemInfo(function(data) {
        res.json(data);
    });
};