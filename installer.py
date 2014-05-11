from subprocess import call, Popen, PIPE
import os
import fileinput
import sys
import json


"""
# Hepler function to validate a return code - can exit if non 0
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
# Install rTorrent and Screen via APT
"""
def installDependenciesViaAPT():
	print("Installing rTorrent and Screen...")
	rc = call(["sudo", "apt-get", "install",  "rtorrent", "screen"])
	validateReturnCode(rc)


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
	node = checkForProgram("node")
	nodeBinDir = node[:node.rfind("/")]
	
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
# Create some directories and configure the rTorrent config file
"""
def configureRtorrent(user, configFile):
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
		# Add the download directory to the config file
		f.write("\n# Default directory to save the downloaded torrents.\n")
		f.write("directory = /home/" + user + "/PiTorrent.Downloads\n")
    	
		# Add the session directory to the config file
		f.write("\n# Default session directory. Do NOT change or rTorrent daemon will fail!\n")
		f.write("session = /home/" + user + "/.PiTorrent.session\n")

		# Add the torrent watch directory to the config file
		f.write("\n# Default directory to watch for .torrent files.\n")
		f.write("schedule = watch_directory,5,5,load_start=/home/" + user + "/PiTorrent.Torrents/*.torrent\n")
    	


"""
# Move the rTorrent config file to the correct dir
"""
def moveRtorrentConfig(user, configFile):
	print "Moving rTorrent config file to /home/" + user + "/.rtorrent.rc ..."
	rc = call(["cp", configFile, "/home/" + user + "/.rtorrent.rc"])
	validateReturnCode(rc)    	


"""
# A function to create the PiTorrent config file
"""
def createPiTorrentConfigFile(user, configFile):
	print "Creating PiTorrent config file... ",
	
	# Create the data needed
	data = {}
	data["rpcSocket"] = "/tmp/rpc.socket"
	data["rootFileSystem"] = "/"
	data["torrentDir"] = "/home/" + user + "/PiTorrent.Torrents/"
	data["downloadDir"] = "/home/" + user + "/PiTorrent.Downloads/"
	data["username"] = "pitorrent"
	data["password"] = "pitorrent"

	# Write to file
	with open(configFile, 'w') as f:
		json.dump(data, f, indent=4)
	
	print "OK"


"""
# Function to install PiTorrent node dependencies - i.e. node modules
"""
def installNodeModules():
	npmLocataion = checkForProgram("npm")
	if npmLocataion == None:
		print "Could not install node modules, npm not found"
	else:
		print "Installing node modules. This may take a while..."
		rc = call([npmLocataion, "install"])
		validateReturnCode(rc)



"""
# Function to install global PiTorrent node dependencies - i.e. global node modules
"""
def installNodeGlobalModules():
	npmLocataion = checkForProgram("npm")
	if npmLocataion == None:
		print "Could not install node modules, npm not found"
	else:
		print "Installing global node modules. This may take a while..."
		rc = call(["sudo", npmLocataion, "install", "-g", "forever"])
		validateReturnCode(rc)


"""
# A function to start the rTorrent daemon
"""
def startRtorrentDaemon():
	rc = call(["sudo", "service", "rtorrent", "start"])
	validateReturnCode(rc)


"""
# A function to start the PiTorrent daemon
"""
def startPiTorrentDaemon():
	rc = call(["sudo", "service", "pitorrent", "start"])
	validateReturnCode(rc)
	print "PiTorrent should be running on http://<ip address>:3000"



user = os.environ["USER"]

installDependenciesViaAPT()

installRtorrentDaemon(user, "./config/daemons/rtorrent")
installPiTorrentDaemon(user, "./config/daemons/pitorrent")

configureRtorrent(user, "./config/rtorrent.rc")
moveRtorrentConfig(user, "./config/rtorrent.rc")

createPiTorrentConfigFile(user, "./config/config.json")

installNodeModules()
installNodeGlobalModules()

startRtorrentDaemon()
startPiTorrentDaemon()
