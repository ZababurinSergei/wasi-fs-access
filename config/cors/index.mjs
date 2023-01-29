import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

export default {
  origin: function (origin, callback) {
    if (pkg.config.list.white.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
