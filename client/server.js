const express = require("express");
const history = require('connect-history-api-fallback')
const serveStatic = require("serve-static")
const path = require('path');

const app = express();

app.use(history({
  // OPTIONAL: Includes more verbose logging
  verbose: true
}))

app.use(serveStatic(path.join(__dirname, 'dist')));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Client server running on port: ${port}`)
});