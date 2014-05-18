# PiTorrent

A GUI for rTorrent written in Node.js, built for use on a Raspberry Pi (but should run on any Linux distribution)

![alt tag](https://raw.githubusercontent.com/seanmheff/PiTorrent/master/public/img/view.png)

Tested with the following distributions:
 
 * Raspbian
 * Linux Mint 15
 * Ubuntu 12.10
 
#### Features
PiTorrent was created to allow users to easily turn a Raspberry Pi into a file-sharing server. It is built around ease-of-use and provides a simple installer to get PiTorrent up and running quickly.

PiTorrent runs as a Linux service and will run automatically on system startup. 

  
#### Dependencies

 * Python 2.7 - needed to run the installer 
 * Node.js - install on Raspbian with:

  ```bash
  cd /tmp
  wget http://node-arm.herokuapp.com/node_latest_armhf.deb
  sudo dpkg -i node_latest_armhf.deb
  ```
  For other distro's, your on your own!

#### Installing
To install, clone or download the repository:
```bash
git clone https://github.com/seanmheff/PiTorrent.git
```

then run the automated installer:
```bash
python installer.py
```

#### Usage
PiTorrent can be started, stopped, etc with:
```bash
sudo service pitorrent {start|stop|status|restart}
```


The underlying torrent client, rTorrent is also daemonized and can be configured with:  
```bash
sudo service rtorrent {start|stop|restart|force-reload}
```

The rTorrent daemon depends on the "screen" utility, and if you wish to attach rTorrent to a terminal, from where you can use it as normal, you can use the following command:
```bash
screen -dr rtorrent
```

Use Ctrl-A Ctrl-D to detach it again


#### Note
PiTorrent is still under heavy development and is a work-in-progress

