/*
 * System commands
 */
SYSTEM_MULTICALL = "system.multicall";


/*
 * Global commands
 */
GLOBAL_DOWNLOAD_SPEED = "get_down_rate";
GLOBAL_UPLOAD_SPEED = "get_up_rate";
GLOBAL_DOWNLOAD_SPEED_LIMIT = "get_download_rate";
GLOBAL_UPLOAD_SPEED_LIMIT = "get_upload_rate";


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
DOWNLOAD_GET_TRACKER_MESSAGE = "d.get_message";
DOWNLOAD_GET_DIRECTORY = "d.get_directory";


/*
 * File related
 */
FILE_MULTICALL = "f.multicall";
FILE_GET_PATH = "f.get_path";
FILE_GET_SIZE_BYTES = "f.get_size_bytes";
FILE_GET_SIZE_CHUNKS = "f.get_size_chunks";
FILE_GET_COMPLETED_CHUNKS = "f.get_completed_chunks";
FILE_GET_PRIORITY = "f.get_priority";


/*
 * Tracker Related
 */
TRACKER_MULTICALL = "t.multicall";
TRACKER_GET_URL = "t.get_url";
TRACKER_GET_MIN_INTERVAL = "t.get_min_interval";
TRACKER_GET_NORMAL_INTERVAL = "t.get_normal_interval";
TRACKER_IS_ENABLED = "t.is_enabled";


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
    DOWNLOAD_GET_COMPLETE + "= ",
    DOWNLOAD_GET_TRACKER_MESSAGE + "= "
];

MULTICALL_FILE_INFO = [
    FILE_GET_PATH + "= ",
    FILE_GET_SIZE_BYTES + "= ",
    FILE_GET_SIZE_CHUNKS + "= ",
    FILE_GET_COMPLETED_CHUNKS + "= ",
    FILE_GET_PRIORITY + "= "
];

MULTICALL_TRACKER_INFO = [
    TRACKER_GET_URL + "= ",
    TRACKER_GET_MIN_INTERVAL + "= ",
    TRACKER_GET_NORMAL_INTERVAL + "= ",
    TRACKER_IS_ENABLED + "= "
];

MULTICALL_GLOBAL_STATS = [
    SYSTEM_MULTICALL,
    GLOBAL_DOWNLOAD_SPEED,
    GLOBAL_UPLOAD_SPEED,
    GLOBAL_DOWNLOAD_SPEED_LIMIT,
    GLOBAL_UPLOAD_SPEED_LIMIT
];

MULTICALL_DETAILED_TORRENT_INFO = [
    SYSTEM_MULTICALL,
    DOWNLOAD_GET_DIRECTORY
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
    DOWNLOAD_GET_TRACKER_MESSAGE : DOWNLOAD_GET_TRACKER_MESSAGE,


    /*
     * File Related
     */
    FILE_MULTICALL      : FILE_MULTICALL,


    /*
     * Tracker Related
     */
    TRACKER_MULTICALL   : TRACKER_MULTICALL,


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
    MULTICALL_STANDARD_INFO : MULTICALL_STANDARD_INFO,
    MULTICALL_FILE_INFO : MULTICALL_FILE_INFO,
    MULTICALL_TRACKER_INFO : MULTICALL_TRACKER_INFO,
    MULTICALL_GLOBAL_STATS : MULTICALL_GLOBAL_STATS,
    MULTICALL_DETAILED_TORRENT_INFO : MULTICALL_DETAILED_TORRENT_INFO

}





