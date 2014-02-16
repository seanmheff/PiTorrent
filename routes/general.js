module.exports = {
    index: index,
    login: login
}


/**
 * Render the index page
 * @param req The HTTP request
 * @param res The HTTP response
 */
function index(req, res) {
    res.render('index');
};


/**
 * Render the login page
 * @param req The HTTP request
 * @param res The HTTP response
 */
function login(req, res) {
    res.render('login');
};
