from subprocess import call, Popen, PIPE
import os
import fileinput
import sys


"""
# Hepler function to validate a return code - exits if non 0
"""
def validateReturnCode(rc, exit=True):
	if rc != 0:
		print "Command exited with rc: " + str(rc)
		if exit:
			sys.exit(1)
	else:
		print "OK\n" 


"""
# Function to check for the presence of a specific program on the system
"""
def checkForProgram(programName):
	p = Popen(["whereis", programName], stdout=PIPE)
	output, err = p.communicate()
	
	if err != None:
		print "Error when checking for " + programName 
		print err
		sys.exit(1)
	else:
		# Output should look like: "node: /usr/local/bin/node"
		# If node is not found, output should look like: "node: "
		tmp = output.split(" ")
		if len(tmp) > 1:
			return tmp[1][:-1] # return second string in list & remove trailing newline character
		else:
			print programName + " is not found on this system..."
			return None


"""
# Install rTorrent via APT
"""
def installRTorrent():
	print("Checking to see if rTorrent is previously installed...")
	if checkForProgram("rtorrent") == None:
		print("rTorrent not found, installing...")
		rc = call(["sudo", "apt-get", "install",  "rTorrent"])
		validateReturnCode(rc)
	else:
		print("rTorrent already installed\n")


"""
# Install Screen via APT
"""
def installScreen():
	print("Checking to see if Screen is previously installed...")
	if checkForProgram("rtorrent") == None:
		print("Screen not found, installing...")
		rc = call(["sudo", "apt-get", "install",  "creen"])
		validateReturnCode(rc)
	else:
		print("Screen already installed\n")


"""
# Helper function to replace variables in a daemon shell script
"""
def replaceDaemonVariables(varsDict, daemonFileLocation):
	for line in fileinput.input(daemonFileLocation, inplace=True):
		if "user=\"{{}}\"" in line:
			print "user=\"" + varsDict["user"] + "\""
		elif "USER=\"{{}}\"" in line:
			print "USER=\"" + varsDict["user"] + "\""
		elif "NODE_BIN_DIR=\"{{}}\"" in line:
			print "NODE_BIN_DIR=\"" + varsDict["nodeBinDir"] + "\""
		elif "NODE_PATH=\"{{}}\"" in line:
			print "NODE_PATH=\"" + varsDict["nodeGlobalModulesDir"] + "\""
		elif "APPLICATION_DIRECTORY=\"{{}}\"" in line:
			print "APPLICATION_DIRECTORY=\"" + varsDict["appDir"] + "\""
		elif "APPLICATION_START=\"{{}}\"" in line:
			print "APPLICATION_START=\"" + varsDict["appName"] + "\""
		elif "PIDFILE=\"{{}}\"" in line:
			print "PIDFILE=\"" + varsDict["pidFile"] + "\""
		elif "LOGFILE=\"{{}}\"" in line:
			print "LOGFILE=\"" + varsDict["logFile"] + "\""
		else:
			print line,


"""
# Install the rTorrent daemon
"""
def installRtorrentDaemon(user, daemonFileLocation):
	print "Installing rTorrent daemon as user: " + user

	print "Replacing script variables... ",
	replaceDaemonVariables({"user":user}, daemonFileLocation)
	print "OK"
	
	# Move the daemon to its rightful place
	print "Moving script to /etc/init.d/"
	rc = call(["sudo", "cp", daemonFileLocation,  "/etc/init.d/"])
	validateReturnCode(rc)

	# Update the init daemon
	print "Enabling the rTorrent daemon init service... "
	call(["sudo", "update-rc.d", "rtorrent", "defaults"])
	validateReturnCode(rc)

	print "rTorrent daemon sucessfully installed\n"


"""
#  A helper function to get the second last occurance of a character
"""
def getSecondLastOccuranceOfChar(string, char):
	return string.rfind(char, 0, string.rfind(char))


"""
# Install the PiTorrent daemon
"""
def installPiTorrentDaemon(user, daemonFileLocation):
	# Find our node binary directory
	nodeBinDir = checkForProgram("node")
	
	# Find our node global modules directoty - can be derived from 'nodeBinDir'
	nodeGlobalModulesDir = nodeBinDir[:getSecondLastOccuranceOfChar(nodeBinDir, "/")] + "/lib/node_modules"
	
	appDir = os.getcwd()
	appName = "app.js"
	pidFile = appDir + "/PiTorrent.pid"
	logFile = appDir + "/PiTorrent.log"

	# Create a dict of variables
	varsDict = {"nodeBinDir":nodeBinDir, "nodeGlobalModulesDir":nodeGlobalModulesDir, "appDir":appDir, "appName":appName, "pidFile":pidFile, "logFile":logFile, "user":user}

	print "Installing PiTorrent daemon as user: " + user
	print "Replacing script variables... ",
	replaceDaemonVariables(varsDict, daemonFileLocation)
	print "OK"

	# Move the daemon to its rightful place
	print "Moving script to /etc/init.d/ - need root access: "
	rc = call(["sudo", "cp", daemonFileLocation,  "/etc/init.d/"])
	validateReturnCode(rc)

	# Update the init daemon
	print "Enabling the PiTorrent daemon init service... "
	call(["sudo", "update-rc.d", "pitorrent", "defaults"])
	validateReturnCode(rc)

	print "PiTorrent daemon sucessfully installed\n"


"""
# Configure rTorrent config file
"""
def configRtorrent(user, configFile):
	# Create some new directories that PiTorrent needs
	downDir = "/home/" + user + "/PiTorrent.Downloads"
	print "Creating download directory: " + downDir 
	validateReturnCode(call(["mkdir", downDir]), exit=False)

	sessionDir = "/home/" + user + "/.PiTorrent.session"
	print "Creating session direstory: " + sessionDir
	validateReturnCode(call(["mkdir", sessionDir]), exit=False)

	torrentDir = "/home/" + user + "/PiTorrent.Torrents"
	print "Creating torrent file directory: " + torrentDir
	validateReturnCode(call(["mkdir", torrentDir]), exit=False)

	# Append data to config
	with open(configFile, "a") as f:
		# Create PiTorrent download dir and add it to config
		f.write("\n# Default directory to save the downloaded torrents.\n")
		f.write("directory = /home/" + user + "/PiTorrent.Downloads\n")
    	
    	# Create rTorrent session dir
		f.write("\n# Default session directory. Do NOT change or rTorrent daemon will fail!\n")
		f.write("session = /home/" + user + "/.PiTorrent.session\n")

    	# Create PiTorrent torrent dir and add it to config
		f.write("\n# Default directory to save the downloaded torrents.\n")
		f.write("schedule = watch_directory,5,5,load_start=/home/" + user + "/PiTorrent.Torrents/*.torrent\n")
    	


"""
# Move the rTorrent config file to the correct dir
"""
def moveRtorrentConfig(user, configFile):
	print "Moving rTorrent config file to /home/" + user + "/.rtorrent.rc ..."
	rc = call(["sudo", "cp", configFile, "/home/" + user + "/.rtorrent.rc"])
	validateReturnCode(rc)    	


"""
# Function to install PiTorrent node dependencies - i.e. node modules
"""
def installNodeModules():
	print "Installing node modules. This may take a while..."
	rc = call(["npm", "install"])
	validateReturnCode(rc)



user = os.environ["USER"]

installRTorrent()
installScreen()

installRtorrentDaemon(user, "./config/daemons/rtorrent")
installPiTorrentDaemon(user, "./config/daemons/pitorrent")

configRtorrent(user, "./config/rtorrent.rc")
moveRtorrentConfig(user, "./config/rtorrent.rc")

installNodeModules()