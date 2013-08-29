/**
 * Created with IntelliJ IDEA.
 * User: sean
 * Date: 03/08/13
 * Time: 18:11
 * To change this template use File | Settings | File Templates.
 */

/*
 * Download related
 */
DOWNLOAD_MULTICALL = "d.multicall";
DOWNLOAD_DOWNLOAD_LIST = "download_list";
DOWNLOAD_GET_TORRENT_HASH = "d.get_hash";
DOWNLOAD_GET_TORRENT_NAME = "d.get_name";
DOWNLOAD_GET_TORRENT_SIZE = "d.get_size_bytes";
DOWNLOAD_GET_COMPLETE = "d.get_complete";
DOWNLOAD_GET_DOWNLOADED = "d.get_completed_bytes";
DOWNLOAD_GET_UPLOAD_RATE = "d.get_up_rate";
DOWNLOAD_GET_DOWNLOAD_RATE = "d.get_down_rate";
DOWNLOAD_GET_TORRENT_RATIO = "d.get_ratio";


/*
 * List of rtorrent views
 */
VIEW_MAIN = "main";
VIEW_NAME = "name";
VIEW_STARTED = "started";
VIEW_STOPPED = "stopped";
VIEW_COMPLETE = "complete";
VIEW_INCOMPLETE = "incomplete";
VIEW_HASHING = "hashing";
VIEW_SEEDING = "seeding";
VIEW_LEECHING = "leeching";

/*
 * List of helpful multicall commands
 */
MULTICALL_STANDARD_INFO = [
    DOWNLOAD_MULTICALL,
    "main",
    DOWNLOAD_GET_TORRENT_HASH + "= ",
    DOWNLOAD_GET_TORRENT_NAME + "= ",
    DOWNLOAD_GET_TORRENT_SIZE + "= ",
    DOWNLOAD_GET_UPLOAD_RATE + "= ",
    DOWNLOAD_GET_DOWNLOAD_RATE + "= ",
    DOWNLOAD_GET_DOWNLOADED + "= ",
    DOWNLOAD_GET_TORRENT_RATIO + "= ",
    DOWNLOAD_GET_COMPLETE + "= "
];

module.exports = {


    /*
     * Download related
     */
    DOWNLOAD_MULTICALL           : DOWNLOAD_MULTICALL,
    DOWNLOAD_DOWNLOAD_LIST       : DOWNLOAD_DOWNLOAD_LIST,
    DOWNLOAD_GET_TORRENT_HASH    : DOWNLOAD_GET_TORRENT_HASH,
    DOWNLOAD_GET_TORRENT_NAME    : DOWNLOAD_GET_TORRENT_NAME,
    DOWNLOAD_GET_TORRENT_SIZE    : DOWNLOAD_GET_TORRENT_SIZE,
    DOWNLOAD_GET_COMPLETE        : DOWNLOAD_GET_COMPLETE,
    DOWNLOAD_GET_DOWNLOADED      : DOWNLOAD_GET_DOWNLOADED,
    DOWNLOAD_GET_UPLOAD_RATE     : DOWNLOAD_GET_UPLOAD_RATE,
    DOWNLOAD_GET_DOWNLOAD_RATE   : DOWNLOAD_GET_DOWNLOAD_RATE,
    DOWNLOAD_GET_TORRENT_RATIO   : DOWNLOAD_GET_TORRENT_RATIO,


    /*
     * List of rtorrent views
     */
    VIEW_MAIN        : VIEW_MAIN,
    VIEW_NAME        : VIEW_NAME,
    VIEW_STARTED     : VIEW_STARTED,
    VIEW_STOPPED     : VIEW_STOPPED,
    VIEW_COMPLETE    : VIEW_COMPLETE,
    VIEW_INCOMPLETE  : VIEW_INCOMPLETE,
    VIEW_HASHING     : VIEW_HASHING,
    VIEW_SEEDING     : VIEW_SEEDING,
    VIEW_LEECHING    : VIEW_LEECHING,


    /*
     * List of helpful multicall commands
     */
    MULTICALL_STANDARD_INFO : MULTICALL_STANDARD_INFO

}





