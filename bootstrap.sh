#!/bin/bash

config_file='config.js'
cron_file='cron'
main_file='cate-monitor'
log_file='log.txt'

echo -e "\033[31m====================================================="
echo -e         "| Bootstraping cate-monitor..."
echo -e         "=====================================================\033[0m"

# Installing dependencies
echo
echo    "Installing dependencies..."

which brew >/dev/null 2>&1
[[ $? -ne 0 ]] && echo "Please install Homebrew from http://brew.sh/" && exit 1

brew install terminal-notifier
brew install phantomjs

# Prompt data
echo
echo    "Creating the configuration file..."

echo -n "Cate username: "
read username

echo -n "Cate password: "
read -s password

# Creating config file
rm -f $config_file

echo "var config = {"           >> $config_file
echo "  user:  '"$username"',"  >> $config_file
echo "  passw: '"$password"',"  >> $config_file
echo "  cwd:   '"`pwd`"'"       >> $config_file
echo "};"                       >> $config_file

chmod 600 $config_file  # rw------- config_file

# Adding to crontab
echo
echo
echo    "Adding as a cronjob and let it run each minute."
echo    "Check \`man crontab\` for more information."

rm -f $cron_file
# disable emails if no crontab or no MAILTO instruction provided
if [[ -z `crontab -l 2>/dev/null | grep MAILTO` ]]; then 
  echo 'MAILTO=""' > $cron_file
fi

crontab -l >> $cron_file
echo "* * * * *  "\"`pwd`"/$main_file\" >"\"`pwd`"/$log_file\" 2>&1" >> $cron_file
crontab $cron_file
rm $cron_file

# Done

echo
echo -e "\033[31m[DONE]\033[0m"

