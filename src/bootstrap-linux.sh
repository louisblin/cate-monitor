#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
config_file="$DIR""/../src/config.json"
cron_file='cron'


[ -e $config_file ] && do_bootstrap=false || do_bootstrap=true
[ "$1" != "--override" ] && do_override=false || do_override=true

function install_dependencies {
    # Check dependencies
    echo    "Checking for brew..."
    which -s brew 2>&1 >/dev/null || ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

    echo    "Checking for node..."
    which -s node 2>&1 >/dev/null || brew install node

    echo    "Checking for yarn..."
    which -s yarn 2>&1 >/dev/null || brew install yarn

    # Install npm dependencies
    cd "$DIR""/.." && yarn install ; cd -
}

function init_config {
    # Configuration file
    echo
    echo    "Creating the configuration file..."

    echo -n "Imperial username: "
    read username

    echo -n "Imperial password: "
    read -s password

    echo '{'                            >> "$config_file"
    echo '  "username": "'$username'",' >> "$config_file"
    echo '  "password": "'$password'"'  >> "$config_file"
    echo '}'                            >> "$config_file"

    # rw------- config_file
    chmod 600 $config_file
}

function cron_cmd {
    echo "export PATH=\$PATH:`dirname $(which $1)` && $1"
}

function init_crontab {
    # Adding to crontab
    echo
    echo
    echo    "Adding as a cronjob and running each minute."
    echo    "Check \`man crontab\` for more information."

    rm -f "$cron_file"
    # disable emails if no crontab or no MAILTO instruction provided
    if [[ -z `crontab -l 2>/dev/null | grep MAILTO` ]]; then
      echo 'MAILTO=""' > "$cron_file"
    fi

    sentinel='cate-monitor-crontab'
    crontab -l | grep -v "$sentinel" >> "$cron_file"

    echo "* * * * * cd \"$DIR/..\" && `cron_cmd yarn` start # $sentinel" >> "$cron_file"

    crontab "$cron_file"
    rm "$cron_file"
}


# Skip if file exists
if [[ "$do_bootstrap" = true || "$do_override" = true ]]; then
  install_dependencies
  init_config
  init_crontab
fi
