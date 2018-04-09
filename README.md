# cate-monitor

*cate-monitor* monitors the grades of a Computing student at Imperial College
London. It runs periodically as a crontab job and notifies the user of any grade
update.

## Dependencies

Depends on `node` and `yarn`, recommended way for install is with Homebrew (see
http://brew.sh is you don't have it):

```shell
brew install node yarn
```

## Install

Clone and run. The install can take a few minutes depending on your internet
connection, as it needs to download ~250MB of dependencies. Also node that the
postinstall step will interactively prompt you for your CATE logins and store
them in `src/config.json`.

```shell
yarn install
```

## License

MIT
