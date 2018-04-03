const puppeteer = require('puppeteer');
var utils = require("./utils");

const URL = process.env.CATE_URL || utils.getUrl();
const PATH_CONFIG = process.env.CATE_CONFIG || __dirname + '/config.json';
const PATH_GRADES = process.env.CATE_GRADES || __dirname + '/../data/cate.old.json';
const PATH_CATE_ICON = __dirname + '/../data/cateIcon.gif';


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

  $.each(cells, function(k, v) {
    // console.log("elem " + k + " : " + v);

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

async function main() {
  // Load config
  const config = utils.readJSONFile(PATH_CONFIG);

  // Perform request
  const browser = await puppeteer.launch({
    // headless: false
  });
  const page = await browser.newPage();
  await page.authenticate(config);
  // Catch network failure
  // Catch file not found
  const response = await page.goto(URL, {
    waitUntil: 'networkidle2'
  });

  // HTTP code handling
  const http_code = response.status();
  switch (http_code) {
    case 200:
      break;
    case 401:
      utils.exit(`Querying ${URL}: credentials don't match`);
    default:
      utils.exit(`Querying ${URL} returned with ${http_code}`);
  }

  // Parse page
  await page.addScriptTag({
    path: require.resolve('jquery')
  });
  const newGrades = await page.evaluate(parsePage);

  // Compute grades diff
  const oldGrades = utils.readJSONFile(PATH_GRADES);
  const diff = computeGradesDiff(oldGrades, newGrades);

  // Notify user of new grades
  for (let key in diff) {
    utils.sendNotification(diff[key], URL, PATH_CATE_ICON);
  }

  // Save new grades for next run
  utils.writeJSONFile(PATH_GRADES, newGrades);

  await browser.close();
};


return main().catch(function(err) {
  utils.exit(err);
});
