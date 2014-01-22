var systemcontroller = require('../controllers/systemcontroller.js');

exports.getSystemStats = function (req, res) {
    systemcontroller.getSystemInfo(function(data) {
        res.json(data);
    });
};