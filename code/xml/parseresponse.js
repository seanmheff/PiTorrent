module.exports = {
    removeResponseHeader : removeResponseHeader
}

/**
 * Parse the rtorrent XML-RPC response, removing its header
 * so we are left with just the XML
 * @param response {object} The XML-RPC call response
 * @returns {string} The XML-RPC response, minus the header
 */
function removeResponseHeader(response) {
    var lines = response.toString().split("\n");
    return lines.slice(4).join("\n");
}


