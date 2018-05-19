import app from './app';
import utils from './utils';

const { CATE_URL, CATE_CONFIG, CATE_GRADES } = process.env;

app.main(
  CATE_URL, CATE_CONFIG, CATE_GRADES
).catch(async err =>
  await utils.exit(err)
);
