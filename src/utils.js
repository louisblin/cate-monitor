var fs = require('fs');
var notifier = require('node-notifier');

const PATH_CATE_ICON = __dirname + '/../data/cateIcon.gif';


(() => {
  module.exports.getUrl = url => {
    // Get school year: [October_{n}, September_{n+1}]
    var now = new Date();
    var year = now.getUTCFullYear() - (now.getUTCMonth() < 10 ? 1 : 0);
    return url + '?key=' + year;
  },

  module.exports.readJSONFile = filepath => {
    try {
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      } else {
        throw err;
      }
    }
  },

  module.exports.writeJSONFile = (filepath, data) => {
    fs.writeFile(filepath, JSON.stringify(data), function(err) {
      if (err) {
        throw err;
      }
    });
  },

  module.exports.sendNotification = (coursework, url) => {
    notifier.notify({
      title: coursework.sub,
      subtitle: coursework.cw,
      message: coursework.grade + ' - click to see on CATE',
      icon: PATH_CATE_ICON,
      open: url,
      timeout: 10,
      // closeLabel: 'Dismiss',
      // actions: 'Open CATE',
    });
  },

  module.exports.exit = (msg, code = 1) => {
    console.error(msg);
    process.exit(code);
  }
})();
