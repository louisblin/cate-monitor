#!/bin/bash

config_file='config.js'
cron_file='cron'
main_file='cate-monitor'
log_file='log.txt'

echo -e "\033[31m====================================================="
echo -e         "| Bootstraping cate-monitor..."
echo -e         "=====================================================\033[0m"

# Prompt data
echo
echo    "Creating the configuration file..."

echo -n "Computing year [1/2/3]: "
read year

echo -n "Cate username:          "
read username

echo -n "Cate password:          "
read password

# Creating config file
rm -f $config_file

echo "var config = {"           >> $config_file
echo "  year:  '"$year"',"      >> $config_file
echo "  user:  '"$username"',"  >> $config_file
echo "  passw: '"$password"',"  >> $config_file
echo "  cwd:   '"`pwd`"'"       >> $config_file
echo "};"                       >> $config_file

chmod 600 $config_file  # rw------- config_file

# Adding to crontab
echo
echo    "Adding as a cronjob and let it run each minute."
echo    "Check \`man crontab\` for more information."

rm -f $cron_file
if [[ -n `crontab -l | grep MAILTO` ]]; then # Disable automatic emails
  echo 'MAILTO=""' > $cron_file
fi

crontab -l > $cron_file
echo "* * * * *  "`pwd`"/$main_file >"`pwd`"/$log_file 2>&1" >> $cron_file
crontab $cron_file
rm $cron_file

# Done

echo
echo -e "\033[31m[DONE]\033[0m"

