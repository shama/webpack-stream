var test = true;

var one = require('./one.js');
require(['./chunk.js'], function(chunk) {
  console.log('chunk!')
});
