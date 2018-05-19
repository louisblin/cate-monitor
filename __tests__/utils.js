import fs from 'fs';
import utils from '../js/utils';

const DEFAULT_CREDENTIALS = { username: 'test', password: 'test' };


test('can read JSON file', () => {
  const PATH_CONFIG = `${__dirname}/data/config.json`;
  const credentials = utils.readJSONFile(PATH_CONFIG);

  expect(credentials).toEqual(DEFAULT_CREDENTIALS);
});

test('reading unexisting file returns null', () => {
  const PATH_CONFIG = `${__dirname}/i-don-t-exist.json`;
  const credentials = utils.readJSONFile(PATH_CONFIG);

  expect(credentials).toBe(null);
});

test('can write and read JSON file', () => {
  const PATH_CONFIG = `${__dirname}/data/config-1.json`;

  utils.writeJSONFile(PATH_CONFIG, DEFAULT_CREDENTIALS);
  const credentials = utils.readJSONFile(PATH_CONFIG);

  expect(credentials).toEqual(DEFAULT_CREDENTIALS);
  fs.unlinkSync(PATH_CONFIG)
});

test('can retrieve passwords', async done => {
  const PATH_CONFIG = `${__dirname}/data/config.json`;
  const credentials = await utils.getCredentials(PATH_CONFIG);

  expect(credentials).toEqual(DEFAULT_CREDENTIALS);
  done();
});
