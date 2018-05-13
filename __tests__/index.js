import app  from '../js/app';
import puppeteer from "puppeteer";

const MINIMAL_GRADES = {
  "subjects": {
    "445H Advanced Security": {
      "name": "445H Advanced Security",
      "grades": {
        "Written assignment": {"identifier": "Written assignment", "grade": "82 / 100 ( A*)"}
      }
    },
    "464 Industrial Placement - Presentation and Report": {
      "name": "464 Industrial Placement - Presentation and Report",
      "grades": {
        "Placement presentation": {"identifier": "Placement presentation", "grade": "4 / 5 ( A*)"},
        "Placement report": {"identifier": "Placement report", "grade": "23 / 25 ( A*)"}
      }
    }
  }
};


test('Can run without error', async done => {
  const URL         = `file://${__dirname}/data/student.html`;
  const PATH_CONFIG = `${__dirname}/data/config.json`;
  const PATH_GRADES = `${__dirname}/data/cate.old.json`;

  const data = await app.main(URL, PATH_CONFIG, PATH_GRADES);
  expect(data).toBeUndefined();
  done();
});


test('Can extract grades from page', async done => {
  const URL = `file://${__dirname}/data/minimal.html`;

  const browser = await puppeteer.launch({});

  try {
    const page = await browser.newPage();
    const response = await page.goto(URL);

    // HTTP code handling
    expect(response.status()).toBe(0);

    // Parse page
    await page.addScriptTag({
      path: require.resolve('jquery')
    });

    // Forward console logs to stdout
    const grades = await page.evaluate(app.parsePage);

    expect(grades).toEqual(MINIMAL_GRADES);

  } finally {
    await browser.close();
    done();
  }
});


test('Can diff same object', () => {
  const diff = app.computeGradesDiff(MINIMAL_GRADES, MINIMAL_GRADES);

  expect(diff).toEqual([]);
});