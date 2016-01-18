var alllibs = require.context('./lib', true, /\.js$/);
alllibs.keys().forEach(alllibs);
