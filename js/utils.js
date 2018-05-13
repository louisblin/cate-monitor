import fs from 'fs';
import notifier from 'node-notifier';
import Raven from 'raven';

// Logging
Raven.config('https://ac39791e426c42f99455ab457209abaa@sentry.io/1198641').install();

const PATH_CATE_ICON = __dirname + '/../data/cateIcon.gif';


export function getUrl(url) {
  // Get school year: [October_{n}, September_{n+1}]
  const now = new Date();
  const year = now.getUTCFullYear() - (now.getUTCMonth() < 10 ? 1 : 0);
  return url + '?key=' + year;
}


export function readJSONFile(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    } else {
      throw err;
    }
  }
}

export function writeJSONFile(filepath, data) {
  fs.writeFile(filepath, JSON.stringify(data), function(err) {
    if (err) {
      throw err;
    }
  });
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


export default { getUrl, readJSONFile, writeJSONFile, sendNotification, exit };