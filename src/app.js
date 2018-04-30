const puppeteer = require('puppeteer');
var utils = require("./utils");


// Customisable by env var
const DEFAULT_URL         = utils.getUrl('https://cate.doc.ic.ac.uk/student.cgi');
const DEFAULT_PATH_CONFIG = __dirname + '/../data/config.json';
const DEFAULT_PATH_GRADES = __dirname + '/../data/cate.old.json';


//
// Parsing logic
//

function parsePage() {
  function CateGrades() {
    this.subjects = {};
  };

  function Subject(name) {
    this.name = name;
    this.grades = {};
  };

  function Grade(identifier, grade) {
    this.identifier = identifier;
    this.grade = grade;
  };

  var mainTable = $("table[border]:has(tbody > tr > th):contains(Exercise)")
    .filter("table:has(tbody > tr > td > b):contains(Total)")[0];
  var cells = mainTable.firstElementChild.children;

  var titleIndex = $(cells[0]).find('th:contains("Title")').first().index();
  var gradeIndex = $(cells[0]).find('th:contains("Grade")').first().index();

  // Iterate through all cells
  var currSubject;
  var cateGrades = new CateGrades();

  $.each(cells, (k, v) => {
    if (!currSubject) {
      var c = $(v).find("td[align=left]");

      // If we find a new subject
      if (c.length > 0) {
        var name = $(c).find("b")[0].innerText.trim();
        var sub = new Subject(name);
        cateGrades.subjects[name] = sub;
        currSubject = sub;
      }
    }
    // Already in a subject
    else {
      var c = $(v).find("td");

      // If we find a new coursework
      if (c.length > 0) {

        var grade = (($(v)
              .find("td")[gradeIndex] || {})
            .innerText || "")
          .trim();

        // Ignore cells of the form...
        if ($(v).find("td[bgcolor!='white']").length > 2 ||
          $(v).find("td").length < 8 ||
          !grade) {
          // Skip cells of the form:
          // - too many non-white cells (like group formations)
          // - not enough cells (like 'no student interaction')
          // - no grade defined
        } else {
          var name = $(v).find("td")[titleIndex].innerText.trim();
          currSubject.grades[name] = new Grade(name, grade);;
        }
      } else {
        currSubject = undefined;
      }
    }
  });

  return cateGrades;
};


//
// Grades diff
//

function computeGradesDiff(oldGrades, newGrades) {
  var diff = [];

  // If previous record exists, otherwise skip
  if (!oldGrades) {
    return diff;
  }

  for (var sub_key in newGrades.subjects) {
    var sub = newGrades.subjects[sub_key];

    for (var cw_key in sub.grades) {
      var cw = sub.grades[cw_key];

      // If new subject, or new coursework, or grade updtated... add to diff
      if (!(sub_key in oldGrades.subjects) ||
        !(cw_key in oldGrades.subjects[sub_key].grades) ||
        (cw.grade != oldGrades.subjects[sub_key].grades[cw_key].grade)) {

        diff.push({
          sub: sub.name,
          cw: cw.identifier,
          grade: cw.grade
        });
      }
    }
  }

  return diff;
};


//
// Entry point
//

async function main(cate_url, path_config, path_grades) {
  cate_url    = cate_url    || DEFAULT_URL;
  path_config = path_config || DEFAULT_PATH_CONFIG;
  path_grades = path_grades || DEFAULT_PATH_GRADES;

  // Load config
  const config = utils.readJSONFile(path_config);

  // Perform request
  const browser = await puppeteer.launch({
    // headless: false,
    // slowMo: 250,
  });

  try {
    const page = await browser.newPage();
    await page.authenticate(config);
    // Catch network failure
    // Catch file not found
    console.info(`Querying at URL '${cate_url}'`);
    const response = await page.goto(cate_url, { waitUntil: 'networkidle0'});

    // HTTP code handling
    const http_code = response.status();
    switch (http_code) {
      case 401:
        await utils.exit(`Querying ${cate_url}: credentials don't match`);
      case 200:
        // HTTP protol returns 200 on success
        break;
      case 0:
        // File protol returns 0 on success
        if (cate_url.startsWith('file://')) {
          break;
        }
      default:
        await utils.exit(`Querying ${cate_url} returned with ${http_code}`);
    }
    console.info(`Return with http_code '${http_code}'`);

    // Parse page
    await page.addScriptTag({
      path: require.resolve('jquery')
    });
    // Forward console logs to stdout
    page.on('console', log => console[log._type](log._text));
    const newGrades = await page.evaluate(parsePage);

    // Compute grades diff
    const oldGrades = utils.readJSONFile(path_grades);
    const diff = computeGradesDiff(oldGrades, newGrades);

    // Notify user of new grades
    for (let key in diff) {
      console.info(`Send notification for ${JSON.stringify(diff[key])}`);
      utils.sendNotification(diff[key], cate_url);
    }

    // Save new grades for next run
    utils.writeJSONFile(path_grades, newGrades);
  } finally {
    await browser.close();
  }
};

module.exports.main = main;
