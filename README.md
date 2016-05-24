# cate-monitor

*cate-monitor* is a deamon program that monitors a Computing students grades 
page at Imperial College. It is runs periodically as a crontab job on MAC OS
machines and uses the NSNotificationCenter to signal any update to the user.

## Install

Running the following commands will download and set up *cate-monitor*

```shell
git clone https://github.com/louisblin/cate-monitor.git
cd cate-monitor
bash bootstrap.sh
```

## License 

MIT
