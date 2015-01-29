
export RUNAS=${USER}

echo Installing agent to run as a background service ...
echo 
echo Service will run as: ${RUNAS}
echo "You will be prompted for sudo (root) password to install the service"
echo

sudo node install.js ${RUNAS}