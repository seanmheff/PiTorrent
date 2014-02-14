var net = require('net');
var nconf = require('nconf').file({ file: 'config/config.json' });



/**
 * This function opens a UNIX socket to the rtorrent API, sends a request and waits for a response
 * @param request {string} The XML-RPC request to send to the socket
 * @param callback {function} The callback that will be called when data is received or an error occurs
 */
function send(request, callback) {
    var socket = new net.Socket().connect(nconf.get('rpcSocket'));
    var firstTime = true;
    var size;
    var response = "";

    socket.on("connect", function() {
        //console.log("Successfully connected to socket");
        socket.write(request);

        socket.on("data", function(data) {
            // Have to make sure the request is complete

            // If its the first time we get data from the socket,
            // we must parse the header to get the "Content-Length" value
            if (firstTime) {
                var contentLengthLine = data.toString().split("\n")[2];
                size = contentLengthLine.substring(contentLengthLine.lastIndexOf(" ")+1, contentLengthLine.length-1);
                firstTime = false;
            }

            response += data;

            if (response.length > size) {
                callback(response);
            }

        });
    });

    socket.on("error", function(err) {
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
