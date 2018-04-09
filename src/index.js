var app = require("./app");
var utils = require("./utils")

const { CATE_URL, CATE_CONFIG, CATE_GRADES } = process.env;


return app.main(
  CATE_URL, CATE_CONFIG, CATE_GRADES
).catch(err =>
  utils.exit(err)
);
