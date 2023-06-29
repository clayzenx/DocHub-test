const { execSync } = require('child_process')

execSync('rm -rf ./backend')
execSync('cp -r ./node_modules/dochubcore/dist/backend ./')
