# webpack-stream incremental builds

Incremental builds work natively as long as you keep webpack in memory.

Run `gulp watch`.

This example loads all the `.js` files from within the `./lib` folder. The first
time it builds, it takes ~400ms. Then you edit a single file in the `./lib` folder
which triggers gulp's watch to run the `default` task. Those subsequent builds
only take ~100ms.
