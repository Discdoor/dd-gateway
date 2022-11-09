# Discdoor Gateway service

This is the gateway server for Discdoor. Think of it as the backbone of the entire platform - this service decides which requests go to what subservices!

Before using it, ensure all submodules are synced first! This is important since the gateway directly hosts the client, which is in a separate module!

## System requirements

* Microsoft Windows 10 or later.

* NodeJS v16 or newer.

## How to get started

* Ensure submodules are synchronized and up-to-date.

* Run `npm install` to install all dependencies.

* Run `node index.js` to start the server.

* Open a browser and navigate to `localhost:9000` to visit the local Discdoor instance.