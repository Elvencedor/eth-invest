const express = require("express");
const serveStatic = require("serve-static")
const path = require('path');

const app = express();

app.use(serveStatic(path.join(__dirname, 'dist')));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Client server running on port: ${port}`)
});