/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 01/08/13
 * Time: 20:44
 * To change this template use File | Settings | File Templates.
 */

var net = require('net');


/**
 * This function opens a UNIX socket to the rtorrent API, sends a request and waits for a response
 * @param request {string} The XML-RPC request to send to the socket
 * @param callback {function} The callback that will be called when data is received or an error occurs
 */
function send(request, callback) {
    var socket = new net.Socket().connect("/tmp/rpc.socket");

    socket.on("connect", function() {
        //console.log("Successfully connected to socket");
        socket.write(request);

        socket.on("data", function(data) {
            //console.log("Got data from socket");
            callback(data);
        });
    });

    socket.on("error", function(err) {
        console.log("Error: " + err);
        callback("error");
    });
}


module.exports = {

    execute : function (request, callback) {
        send(request, function(response) {
            callback(response);
        });
    }

};
