var clients = [];
var unsentMessages = [];

module.exports = function(server) {

    server.on('connection', function(client) {

        console.log("Client " + client.id + " added");

        clients.push(client);

        if (unsentMessages.length > 0) {
            sendUnsentMessages(client);
        }

        client.on('message', function(data) {
            console.log(data);
        });

        client.on('close', function() {
            var index = clients.indexOf(client);
            if (index > 0) {
                clients.splice(index, 1);
                console.log("Client " + client.id + " disconnected");
            }
        });

    });


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


    function sendUnsentMessages(client) {
        for (var i=0; i<unsentMessages.length; i++) {
            client.send(JSON.stringify(unsentMessages[i]));
        }
        // Clear the array
        unsentMessages.length = 0
    }


    function sendRssTorrentAddedMessage(message) {
        var msg = {
            type: "rssTorrentAdded",
            msg: message,
            date: new Date()
        };
        sendToAll(msg);
    }


    function sendGetRssFeedFailedMessage(feedURL, err) {
        var msg = {
            type: "getRssFailed",
            msg: feedURL,
            err: err,
            date: new Date()
        };
        sendToAll(msg);
    }


    function sendGetTorrentFailedMessage(url, err) {
        var msg = {
            type: "getTorrentFailed",
            msg: url,
            err: err,
            date: new Date()
        };
        sendToAll(msg);
    }


    module.exports = {
        sendRssTorrentAddedMessage: sendRssTorrentAddedMessage,
        sendGetRssFeedFailedMessage: sendGetRssFeedFailedMessage,
        sendGetTorrentFailedMessage: sendGetTorrentFailedMessage
    }

}