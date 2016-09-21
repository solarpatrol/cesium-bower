# Cesium

This is a [Bower](http://bower.io/) package for amazing [Cesium](http://cesiumjs.org) JavaScript library
for creating 3D globes and 2D maps in a web browser without a plugin.

The package contains source files from original `Source` directory under `src` directory and a version built
with original `npm run minifyRelease` [Gulp.js](http://gulpjs.com/) task under `dist` directory. Please note
that latest [Node.js](http://nodejs.org) is required to run the task properly.

## Installation

In order to install Cesium with Bower run:

    bower install cesium.js
    
## How to add new Cesium release
    
Follow these steps to update this Bower package to a new version of Cesium:
    
1. Install recent [Node.js](https://nodejs.org/) and [Node Package Manager](https://npmjs.com/). Using
[NVM](https://github.com/creationix/nvm) installation script is a preferable way to do this. [Git](https://git-scm.com/)
is also required to clone repositories.

2. Install [Gulp.js](http://gulpjs.com/) command line interface globally:

        npm install -g gulp-cli

3. Clone this repository:

        git clone git@github.com:solarpatrol/cesium-bower /path/to/local/cesium-bower
        
4. Switch to `dev` branch:
        
        git checkout dev

5. Initialize [Cesium](https://github.com/solarpatrol/cesium) Git submodule:

        cd /path/to/local/cesium-bower
        git submodule init
        git submodule update

6. Cesium Git submodule is a fork of [original Cesium repository](https://github.com/AnalyticalGraphicsInc/cesium)
provided by Analytical Graphics Inc. In order to be able to update to the latest changes made in original repository a
remote for this one should be added:

        cd ./cesium
        git remote add cesium git@github.com:AnalyticalGraphicsInc/cesium
        
7. Get latest changes from original repository and push them to the fork:

        git checkout master
        git fetch cesium
        git merge cesium/master
        git push origin master
        git push origin --tags

8. Checkout release commit marked by a tag. Say, it's `1.25` for version 1.25:
        
        git checkout 1.25
        
9. Reinstall node modules used to build Cesium (this step can be skipped if nothing has changed in `package.json`
since previous Cesium release):
        
        rm -Rf node_modules
        npm install
        
10. Remove output files from previous build:
        
        npm run clean
        
11. Build new Cesium release:
        
        npm run minifyRelease
        
12. Update `src` and `dist` directories of Bower package:
        
        cd /path/to/local/cesium-bower
        rm -Rf ./src
        cp -R ./cesium/Source ./src
        rm -Rf ./dist
        cp -R ./cesium/Build/Cesium ./dist
        
13. Add changes to repository:
        
        git add cesium
        git commit -m "Cesium is updated to 1.25."
        git add -A
        git commit -m "src and dist directories are updated to version 1.25."
        git checkout master
        git merge --no-ff dev -m "Version 1.25.0."
        git tag -a 1.25.0 -m "Version 1.25.0."
        git push origin dev
        git push origin master
        git push origin --tags

## Contribution

Before making a pull request, please, be sure that your changes are rebased to `dev` branch.
