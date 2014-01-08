var xmlbuilder = require('xmlbuilder');

/* Our module exports */
module.exports = {
    createRequest : createRequest,
    createMulticallRequest : createMulticallRequest,
    createFileMulticallRequest : createFileMulticallRequest
};


/**
 * This function takes an XML string as its input and builds a valid XML-RPC request
 * @param {string} xml The XML string
 * @return {string} This is the spoofed XML-RPC call
 */
function formatRequest(xml){

    /* Build the header of the request */
    var header = "";
    header += "CONTENT_LENGTH\000";
    header += xml.length;
    header += "\000";
    header += "SCGI\0001\000";

    /* Build the request */
    var request = "";
    request += header.length;
    request += ":";
    request += header;
    request += ",";
    request += xml;

    return request;
}


/**
 * A method to create a XML-RPC string based on some input parameters
 * @param args The parameter(s) you want to give to the request
 * @return {string} Returns an XML formatted string containing the parameter(s)
 */
function createXml(args) {
    var xml = xmlbuilder.create("methodCall");
    xml.ele("methodName", args[0]);

    // If we need to add any parameters
    if (args.length > 1) {
        var params = xml.ele("params");

        for (var i = 1; i < args.length; i++) {
            params.ele("param").ele("value").ele("string", args[i]);
        }
    }
    return xml.toString();
}


/**
 * A method to create a multicall XML-RPC string based on some input parameters
 * Multicalls are useful as they allow us to execute multiple functions in parallel
 * @param args The parameter(s) you want to give to the request
 * @returns {string} Returns an XML formatted string containing the parameter(s)
 */
function createMulticallXml(args) {
    var xml = xmlbuilder.create("methodCall");
    xml.ele("methodName", "system.multicall");
    var data = xml.ele("params").ele("param").ele("value").ele("array").ele("data");

    for (var i = 1; i < args.length; i++) {
        var struct = data.ele("value").ele("struct");

        var member1 = struct.ele("member");
        member1.ele("name", "methodName")
        member1.ele("value").ele("string", args[i]);

        var member2 = struct.ele("member");
        member2.ele("name", "params")
        member2.ele("value").ele("array").ele("data").ele("value").ele("string");
    }
    return xml.toString();
}

function createFileMulticallXml(hash, args) {
    var xml = xmlbuilder.create("methodCall");
    xml.ele("methodName", "f.multicall");
    var params = xml.ele("params")
    params.ele("param").ele("value").ele("string", hash.toString());
    params.ele("param").ele("value").ele("i4", "0");

    for (var i = 0; i < args.length; i++) {
        params.ele("param").ele("value").ele("string", args[i]);
    }
    return xml.toString();
}


/**
 * Function that needs to be exported to the module.
 * It calls the private functions
 * @param args The arguments to give to the request builder
 * @returns {string} Returns a valid XML-RPC formatted string containing the arguments
 */
function createRequest(args) {
    return formatRequest(createXml(args));
}


/**
 * Function that needs to be exported to the module.
 * It calls the private functions
 * @param args The arguments to give to the request builder
 * @returns {string} Returns a valid XML-RPC formatted string containing the arguments
 */
function createMulticallRequest(args) {
    return formatRequest(createMulticallXml(args));
}

function createFileMulticallRequest(hash, args) {
    return formatRequest(createFileMulticallXml(hash, args));
}