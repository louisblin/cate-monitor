import fs from 'fs';
import notifier from 'node-notifier';
import Raven from 'raven';
import keychain from 'keychain';

// Logging
Raven.config('https://ac39791e426c42f99455ab457209abaa@sentry.io/1198641').install();

const PATH_CATE_ICON = __dirname + '/../data/cateIcon.gif';


export function getUrl(url) {
  // Get school year: [October_{n}, September_{n+1}]
  const now = new Date();
  const year = now.getUTCFullYear() - (now.getUTCMonth() < 10 ? 1 : 0);
  return `${url}?key=${year}`;
}

function nullify_missing_file (fn) {
  try {
    return fn();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    } else {
      throw err;
    }
  }
}

export function readJSONFile(filepath) {
  return nullify_missing_file(
    () => JSON.parse(fs.readFileSync(filepath, 'utf8'))
  );
}

export function writeJSONFile(filepath, data) {
  return nullify_missing_file(
    () => fs.writeFileSync(filepath, JSON.stringify(data))
  );
}

export async function getCredentials(path_config) {
  var { username, password } = readJSONFile(path_config);

  if (process.platform === 'darwin' && password == "keychain") {

    password = await new Promise(resolve =>
      keychain.getPassword({
        account: username,
        service: 'CATE',
        type: 'internet'
      }, (err, _pw) => {
        err && exit(`Error while getting password from keychain: ${err.message}`)
        resolve(_pw);
      })
    );
  }

  return { username, password };
}

export async function saveCredentials(username, password) {
  await keychain.setPassword({
    account: username,
    service: 'CATE',
    type: 'internet',
    password: password
  }, err =>
    err && exit(`Error while saving password to keychain: ${err.message}`)
  );
}

export function sendNotification(coursework, url) {
  notifier.notify({
    title: coursework.sub,
    subtitle: coursework.cw,
    message: coursework.grade + ' - click to see on CATE',
    icon: PATH_CATE_ICON,
    open: url,
    timeout: 10
    // closeLabel: 'Dismiss',
    // actions: 'Open CATE',
  });
}

export async function exit(msg, code = 1) {
  console.error(msg);

  // Await for message to be sent...
  Raven.captureException(msg);
  await new Promise(resolve => setTimeout(resolve, 1000));

  process.exit(code);
}


export default {
  getUrl, readJSONFile, writeJSONFile, getCredentials, saveCredentials,
  sendNotification, exit
};
