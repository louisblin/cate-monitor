'use strict'

var page = require('webpage').create();

var url    = 'https://cate.doc.ic.ac.uk/student.cgi?key=2017:';
var config = './config.js'

// Timeout settings
page.settings.resourceTimeout = 30000;  // 30 seconds
page.onResourceTimeout = function(e) {
    phantom.exit(1);
}

if (phantom.injectJs(config)) {
  page.settings.userName = config.user;
  page.settings.password = config.passw;
  var cwd = config.cwd + "/";
  url += config.user;
}
else {
  console.log("Error injecting config. Missing " + config + " file");
  phantom.exit(1);
}

// Display all console messages
page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.open(url, function(status) {

  if (status != "success") {
    console.log("[" + status + "]");
    phantom.exit(1);
  }

  // New Grades
  var newGrades;

  if (page.injectJs("res/jquery.min.js")) {

    var json = page.evaluate(function(CateGrades, Subject, Grade, parsePage) {
        var cg = parsePage(CateGrades, Subject, Grade);
        return cg.to_json();
    }, CateGrades, Subject, Grade, parsePage);

    console.log(json); // to be saved to file by deamon
    newGrades = JSON.parse(json);
  }

  // Old Grades
  var oldGrades = JSON.parse(fetchOldGrades("res/cate.old.json"));

  // If old file exists, otherwise skip step
  if (oldGrades.subjects) {
    // Compute diff
    var diff = [];
    for (var sub_key in newGrades.subjects) {
      var sub = newGrades.subjects[sub_key];

      for (var cw_key in sub.grades) {
        var cw = sub.grades[cw_key];

        // If new subject, or new coursework, or grade updtated... add to diff
        if (!(sub_key in oldGrades.subjects) ||
            !(cw_key  in oldGrades.subjects[sub_key].grades) ||
             (cw.grade != oldGrades.subjects[sub_key].grades[cw_key].grade)) {

          diff.push({sub: sub.name, cw: cw.identifier, grade: cw.grade});
        }
      }
    }
  }

  // Display diff
  for (var key in diff) {
    console.log(diff[key].sub +"||"+ diff[key].cw +"||"+ diff[key].grade);
  }

  phantom.exit();
});

/************
 * Classes
 */

function CateGrades() {
  this.subjects = {};

  this.to_json = function() {
    var str = '{"subjects":[';
    var isFirst = true;
    for (var key in this.subjects) {
      if (!isFirst) {
        str += ',';
      }
      isFirst = false;
      str += this.subjects[key].to_json();
    }
    str += ']}';
    return str;
  }
};

function Subject(name) {
  this.name = name;
  this.grades = {};

  this.to_json = function() {
    var str = '{"name":"' + this.name + '","grades":[';
    isFirst = true;
    for (var key in this.grades) {
      if (!isFirst) {
        str += ',';
      }
      isFirst = false;
      str += this.grades[key].to_json();
    }
    str += ']}';
    return str;
  }
};

function Grade(identifier, grade) {
  this.identifier = identifier;
  this.grade = grade;

  this.to_json = function () {
    return JSON.stringify(this);
  }
};

/**************
 * Parsing func
 */
function parsePage(CateGrades, Subject, Grade) {

  var mainTable = $("table[border]:has(tbody > tr > th):contains(Exercise)")
    .filter("table:has(tbody > tr > td > b):contains(Total)")[0];
  var cells = mainTable.firstElementChild.children;

  // Iterate through all cells
  var currSubject;
  var cateGrades = new CateGrades();

  $.each(cells, function( k, v ) {
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

        // Ignore cells of the form...
        if ($(v).find("td[bgcolor!='white']").length > 2 ||
            $(v).find("td").length < 8 ||
            !((v.lastChild.previousSibling.innerText || "").trim()) ) { // Where the grade is
          // Skip cells of the form:
          // - nearly no white cell (like group formations)
          // - with 'no student interaction'
          // - innerText only contains blanks
        }
        else {
          var name  = $(v).find("td")[2].innerText.trim();
          var g     = $(v).find("td")[7].innerText.trim();
          var grade = new Grade(name, g);
          currSubject.grades[name] = grade;
        }
      }
      else {
        currSubject = undefined;
      }
    }
  });

  return cateGrades;
};

function fetchOldGrades(file) {

  var fs = require('fs'),
      system = require('system');

  var content = {},
      f = null;

  try {
      f = fs.open(file, "r");
      content = f.read();
  } catch (e) {
      console.log(e);
  }

  if (f) {
      f.close();
  }

  return content;
}
