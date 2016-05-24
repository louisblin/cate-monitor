# cate-monitor

*cate-monitor* is a deamon program that monitors the grades of a Computing 
student at Imperial College London. It runs periodically as a crontab job on
a MAC OS machine and uses the NSNotificationCenter to signal any update to the 
user.

## Dependencies

Required before installing:
- Homebrew: see http://brew.sh/ if you don't have it.

Installed by bootstrapping script (with Homebrew):
- terminal-notifier
- phantomjs

## Install

Running the following commands will download and set up *cate-monitor*. The 
bootstrapping script (last command) will interactively prompt you for your 
Cate logins and create the required `config.js`.

```shell
git clone https://github.com/louisblin/cate-monitor.git
cd cate-monitor
bash bootstrap.sh
```

## License 

MIT
