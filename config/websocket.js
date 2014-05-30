var clients = [];
var unsentMessages = [];

module.exports = function(server) {

    /**
     * This function is triggered when a client connects to the server
     */
    server.on('connection', function(client) {
        console.log("Client " + client.id + " connected");

        // We keep a list of currently connected clients. Add this client to that list
        clients.push(client);

        // If there are any messages needing to be sent - send them to this client
        if (unsentMessages.length > 0) {
            sendUnsentMessages(client);
        }

        /**
         * When a client disconnects, remove them from the list of currently connected clients
         */
        client.on('close', function() {
            var index = clients.indexOf(client);
            if (index > 0) {
                clients.splice(index, 1);
                console.log("Client " + client.id + " disconnected");
            }
        });
    });


    /**
     * A private function to send a JSON message to all connected clients.
     * If no clients are connected, the message in stored in memory until a client connects.
     * Once a client connects, the message is sent to that client and then removed from memory.
     * @param msg The JSON message to send
     */
    function sendToAll(msg) {
        if (clients.length === 0) {
            unsentMessages.push(msg);
        }
        else {
            for (var i=0; i<clients.length; i++) {
                clients[i].send(JSON.stringify(msg));
            }
        }
    }


    /**
     * A private function to send unsent messages to a client.
     * This function should be called once a client connects, and if there are unsent messages waiting to be sent.
     * This function also clears the unsent messages array, once the messages have been sent.
     * @param client The client object - an instance of an engine.io Socket
     */
    function sendUnsentMessages(client) {
        for (var i=0; i<unsentMessages.length; i++) {
            client.send(JSON.stringify(unsentMessages[i]));
        }
        // Clear the array
        unsentMessages.length = 0
    }


    /**
     * A public function to send a "RSS Torrent Added" message to all connected clients.
     * This function should be called when the RSS controller downloads a .torrent file that matches an RSS query term.
     * @param message The message to send to the client. Typically, you would want to send the client the name or URL
     * of the torrent
     */
    function sendRssTorrentAddedMessage(message) {
        var msg = {
            type: "rssTorrentAdded",
            msg: message,
            date: new Date()
        };
        sendToAll(msg);
    }


    /**
     * A public function to send a "GET RSS feed failed" message to all connected clients.
     * This function should be called when the RSS controller cannot GET a RSS feed for whatever reason.
     * @param feedURL The URL of the RSS feed
     * @param err The error produced when trying to GET the RSS feed
     */
    function sendGetRssFeedFailedMessage(feedURL, err) {
        var msg = {
            type: "getRssFailed",
            msg: feedURL,
            err: err,
            date: new Date()
        };
        sendToAll(msg);
    }


    /**
     * A public function to send a "GET Torrent failed" message to all connected clients.
     * This function should be called by any function that tries to GET a .torrent file, but fails.
     * @param url The URL of the .torrent file
     * @param err The error produced when trying to GET the .torrent file
     */
    function sendGetTorrentFailedMessage(url, err) {
        var msg = {
            type: "getTorrentFailed",
            msg: url,
            err: err,
            date: new Date()
        };
        sendToAll(msg);
    }


    /**
     * Notice that we are re-initialising our module.exports variable.
     * We are doing this as the original module.exports acts as a bootstrap function that initialises this module
     * and should only be called once, when the application starts.
     * This new module.exports objects defines the internal functions that other modules can call.
     */
     module.exports = {
        sendRssTorrentAddedMessage: sendRssTorrentAddedMessage,
        sendGetRssFeedFailedMessage: sendGetRssFeedFailedMessage,
        sendGetTorrentFailedMessage: sendGetTorrentFailedMessage
    }
};