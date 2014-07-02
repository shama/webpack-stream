var test = require('tape');
var webpack = require('../');
var File = require('vinyl');
var path = require('path');
var fs = require('fs');

var base = path.resolve(__dirname, 'fixtures');

test('streams output assets', function(t) {
  t.plan(3);
  var stream = webpack({
    output: {
      filename: 'bundle.js'
    },
    quiet: true,
  });
  var entry = new File({
    cwd: base,
    base: base,
    path: path.join(base, 'entry.js'),
    contents: fs.createReadStream(path.join(base, 'entry.js'))
  });
  stream.on('data', function(file) {
    var basename = path.basename(file.path);
    var contents = file.contents.toString();
    switch (basename) {
      case 'bundle.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case '1.bundle.js':
        t.ok(/var chunk = true;/i.test(contents), 'should contain "var chunk = true;"');
      break;
    }
  });
  stream.write(entry);
  stream.end();
});
