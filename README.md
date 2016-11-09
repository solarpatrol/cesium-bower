# Cesium

This is a [Bower](http://bower.io/) package for amazing [Cesium](http://cesiumjs.org) JavaScript library
for creating 3D globes and 2D maps in a web browser without a plugin.

The package contains source files from original `Source` directory under `src` directory and a version built
with original `npm run minifyRelease` [Gulp.js](http://gulpjs.com/) task under `dist` directory. Please note
that latest [Node.js](http://nodejs.org) is required to run the task properly.

## Installation

In order to install Cesium with Bower run:

    bower install cesium.js
    
## How to prepare new Cesium release    

1. Install recent [Node.js](https://nodejs.org/) and [Node Package Manager](https://npmjs.com/). Using
[NVM](https://github.com/creationix/nvm) installation script is a preferable way to do this. [Git](https://git-scm.com/)
is also required to clone repositories.

2. Clone this repository:

        git clone git@github.com:solarpatrol/cesium-bower /path/to/cesium-bower
        
3. Switch to `dev` branch:
                
        git checkout dev
        
4. Install development dependencies:

        cd /path/to/cesium-bower
        npm install
        
5. Run update script passing Cesium version to update to (say, to `1.27`):

        npm run update 1.27.0
        
    This one will do the following steps:
    
    - update version fields in `package.json` file of this repository;
    - install corresponding version of official [Cesium](https://www.npmjs.com/package/cesium) package in `node_modules`;
    - copy source and build files from Cesium package to `src` and `dist` directories;
    - commit all changes to current (`dev`) branch.
    
    If you get a message like
    
    > Bower package is already @1.27.0
    
    but want to continue update anyway then run:
     
        npm run update 1.27.0 -- --force
    
6. If you are a maintainer of this repository then merge all changes into `master` branch:

        git checkout master
        git merge --no-ff dev -m "Version 1.27.0."
        git tag -a 1.27.0 -m "Version 1.27.0."
        
    If you are a contributor then [create a pull request](https://github.com/solarpatrol/cesium-bower/pull/new/dev) to
    `dev` branch.
    
## How to build new Cesium release manually (deprecated)
    
Follow these steps to update this Bower package with custom Cesium build manually:
    
1. Install recent [Node.js](https://nodejs.org/) and [Node Package Manager](https://npmjs.com/). Using
[NVM](https://github.com/creationix/nvm) installation script is a preferable way to do this. [Git](https://git-scm.com/)
is also required to clone repositories.

2. Install [Gulp.js](http://gulpjs.com/) command line interface globally:

        npm install -g gulp-cli

3. Clone this repository:

        git clone git@github.com:solarpatrol/cesium-bower /path/to/cesium-bower
        
4. Switch to `dev` branch:
        
        git checkout dev

5. Initialize [Cesium](https://github.com/solarpatrol/cesium) Git submodule:

        cd /path/to/cesium-bower
        git submodule init
        git submodule update

6. Checkout release commit marked by a tag. Say, it's `1.27` for version 1.27:
        
        cd ./cesium
        git checkout 1.27
        
7. Reinstall node modules used to build Cesium (this step can be skipped if nothing has changed in `package.json`
since previous Cesium release):
        
        rm -Rf node_modules
        npm install
        
8. Remove output files from previous build:
        
        npm run clean
        
9. Build new Cesium release:
        
        npm run minifyRelease
        
10. Update `src` and `dist` directories of Bower package:
        
        cd /path/to/cesium-bower
        rm -Rf ./src
        cp -R ./cesium/Source ./src
        rm -Rf ./dist
        cp -R ./cesium/Build/Cesium ./dist
        
11. Add changes to repository:
        
        git add cesium
        git commit -m "Cesium is updated to 1.27."
        git add -A
        git commit -m "src and dist directories are updated to version 1.27."
        git checkout master
        git merge --no-ff dev -m "Version 1.27.0."
        git tag -a 1.27.0 -m "Version 1.27.0."
        git push origin dev
        git push origin master
        git push origin --tags
                
12. Update version fields in `package.json` file and commit it:
 
        git add package.json
        git commit -m "Version bump."

## Contribution

Before making a pull request, please, be sure that your changes are rebased to `dev` branch.
