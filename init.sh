#!/bin/bash

echo "Install npm packages."
npm install

echo "Create configuration file."
cp sample.config.js config.js

echo "Installation is finished."