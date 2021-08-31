const test = require('tape');
const webpack = require('../');
const path = require('path');
const fs = require('vinyl-fs');
const named = require('vinyl-named');

const base = path.resolve(__dirname, 'fixtures');

test('streams output assets', function (t) {
  t.plan(3);
  const entry = fs.src('test/fixtures/entry.js');
  const stream = webpack({
    config: {
      mode: 'development',
      output: {
        filename: 'bundle.js'
      }
    },
    quiet: true
  });
  stream.on('data', function (file) {
    const basename = path.basename(file.path);
    const contents = file.contents.toString();
    switch (basename) {
      case 'bundle.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case 'test_fixtures_chunk_js.bundle.js':
        t.ok(/var chunk = true;/i.test(contents), 'should contain "var chunk = true;"');
        break;
    }
  });
  entry.pipe(stream);
});

test('multiple entry points', function (t) {
  t.plan(3);
  const stream = webpack({
    config: {
      mode: 'development',
      entry: {
        one: path.join(base, 'entry.js'),
        two: path.join(base, 'anotherentrypoint.js')
      },
      output: {
        filename: '[name].bundle.js'
      }
    },
    quiet: true
  });
  stream.on('data', function (file) {
    const basename = path.basename(file.path);
    const contents = file.contents.toString();
    switch (basename) {
      case 'one.bundle.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case 'two.bundle.js':
        t.ok(/var anotherentrypoint = true;/i.test(contents), 'should contain "var anotherentrypoint = true;"');
        break;
    }
  });
  stream.end();
});

test('stream multiple entry points', function (t) {
  t.plan(3);
  const entries = fs.src(['test/fixtures/entry.js', 'test/fixtures/anotherentrypoint.js']);
  const stream = webpack({
    config: {
      mode: 'development'
    },
    quiet: true
  });
  stream.on('data', function (file) {
    const basename = path.basename(file.path);
    const contents = file.contents.toString();
    switch (basename) {
      case 'entry.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case 'anotherentrypoint.js':
        t.ok(/var anotherentrypoint = true;/i.test(contents), 'should contain "var anotherentrypoint = true;"');
        break;
    }
  });
  entries.pipe(named()).pipe(stream);
});

test('empty input stream', function (t) {
  t.plan(1);

  const entry = fs.src('test/path/to/nothing', { allowEmpty: true });
  const stream = webpack({
    config: {},
    quiet: true
  });
  let data = null;

  stream.on('data', function (file) {
    data = file;
  });

  stream.on('end', function () {
    t.ok(data === null, 'should not write any output');
  });

  entry.pipe(named()).pipe(stream);
});

test('multi-compile', function (t) {
  t.plan(3);

  const stream = webpack({
    quiet: true,
    config: [{
      mode: 'development',
      entry: {
        one: path.join(base, 'entry.js')
      },
      output: {
        filename: '[name].bundle.js'
      }
    }, {
      mode: 'development',
      entry: {
        two: path.join(base, 'anotherentrypoint.js')
      },
      output: {
        filename: '[name].bundle.js'
      }
    }]
  });
  stream.on('data', function (file) {
    const basename = path.basename(file.path);
    const contents = file.contents.toString();
    switch (basename) {
      case 'one.bundle.js':
        t.ok(/__webpack_require__/i.test(contents), 'should contain "__webpack_require__"');
        t.ok(/var one = true;/i.test(contents), 'should contain "var one = true;"');
        break;
      case 'two.bundle.js':
        t.ok(/var anotherentrypoint = true;/i.test(contents), 'should contain "var anotherentrypoint = true;"');
        break;
    }
  });
  stream.end();
});

test('no options', function (t) {
  t.plan(1);
  const stream = webpack();
  stream.on('end', function () {
    t.ok(true, 'ended without error');
  });
  stream.end();
});

test('config file path with webpack-stream options', function (t) {
  t.plan(1);
  const stream = webpack({
    quiet: true,
    config: path.join(base, 'webpack.config.js')
  });
  stream.on('end', function () {
    t.ok(true, 'config successfully loaded from file, with webpack-stream options');
  });
  stream.end();
});

test('error formatting', function (t) {
  t.plan(2);
  // TODO: Fix this to test to rely less on large string outputs as those can change
  // and still be ok.
  const expectedMessage = '\x1b[31mError\x1b[39m in plugin "\x1b[36mwebpack-stream\x1b[39m"\nMessage:\n    Module Error (from ./test/fake-error-loader.js):\nFake ';
  const entry = fs.src('test/fixtures/entry.js');
  const stream = webpack({
    quiet: true,
    config: {
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            use: './test/fake-error-loader'
          }
        ]
      }
    }
  });
  stream.on('error', function (err) {
    t.equal(err.toString().slice(0, expectedMessage.length), expectedMessage, 'error message');
  });
  stream.on('compilation-error', function (err) {
    t.equal(err.toString().slice(0, expectedMessage.length), expectedMessage, 'compilation-error message');
  });
  entry.pipe(stream);
});
