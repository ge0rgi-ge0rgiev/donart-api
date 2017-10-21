#!/bin/bash

echo "Install npm packages."
npm install

echo "Create configuration file."
cp sample.config.js config.js

echo "Create logs folder."
mkdir logs

echo "Installation is finished."