from subprocess import call, Popen, PIPE
import os
import fileinput
import sys


"""
# Hepler function to validate a return code - exits if non 0
"""
def validateReturnCode(rc):
	if rc != 0:
		print "Command exited with rc: " + str(rc)
		sys.exit(1)
	else:
		print "OK" 


"""
# Helper function to replace variables in the daemon shell script
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
	print "Moving script to /etc/init.d/ - need root access: "
	rc = call(["sudo", "cp", daemonFileLocation,  "/etc/"])
	validateReturnCode(rc)

	# Update the init daemon
	print "Enabling the rTorrent daemon init service... "
	call(["sudo", "update-rc.d", "rtorrent", "defaults"])
	validateReturnCode(rc)

	print "rTorrent daemon sucessfully installed"


"""
# Function to check for node.js on the system
"""
def checkForNodeJS():
	p = Popen(["whereis", "node"], stdout=PIPE)
	output, err = p.communicate()
	
	if err != None:
		print "Error when checking for node.js: " 
		print err
		sys.exit(1)
	else:
		# Output should look like: "node: /usr/local/bin/node"
		# If node is not found, output should look like: "node: "
		tmp = output.split(" ")
		if len(tmp) > 1:
			return tmp[1]
		else:
			print "Node.js is not found on this system... exiting"
			sys.exit(1)



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
	nodeBinDir = checkForNodeJS()
	
	# Find our node global modules directoty - can be derived from 'nodeBinDir'
	nodeGlobalModulesDir = nodeBinDir[:getSecondLastOccuranceOfChar(nodeBinDir, "/")] + "/usr/local"
	
	appDir = os.getcwd()
	appName = "app.js"
	pidFile = appDir + "/PiTorrent.pid"
	logFile = appDir + "/PiTorrent.log"

	# Create a dict of variables
	varsDict = {"nodeBinDir":nodeBinDir, "nodeGlobalModulesDir":nodeGlobalModulesDir, "appDir":appDir, "appName":appName, "pidFile":pidFile, "logFile":logFile}

	print "Installing PiTorrent daemon as user: " + user
	print "Replacing script variables... ",
	replaceDaemonVariables(varsDict, daemonFileLocation)
	print "OK"

	# Move the daemon to its rightful place
	print "Moving script to /etc/init.d/ - need root access: "
	rc = call(["sudo", "cp", daemonFileLocation,  "/etc/"])
	validateReturnCode(rc)

	# Update the init daemon
	print "Enabling the PiTorrent daemon init service... "
	call(["sudo", "update-rc.d", "pitorrent", "defaults"])
	validateReturnCode(rc)

	print "PiTorrent daemon sucessfully installed"



user = os.environ["USER"]
installRtorrentDaemon(user, "./config/daemons/rtorrent")
installPiTorrentDaemon(user, "./config/daemons/pitorrent")

