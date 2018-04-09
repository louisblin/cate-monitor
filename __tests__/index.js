var app = require('../src/app');

const URL         = 'file://' + __dirname + '/data/student.html';
const PATH_CONFIG = __dirname + '/data/config.json';
const PATH_GRADES = __dirname + '/data/cate.old.json';


test('it works!', async done => {
  await app.main(
    URL, PATH_CONFIG, PATH_GRADES
  ).then(data => {
    console.log('here then');
    expect(data).toBeUndefined();
    done();
  })
  .catch(err => {
    console.log('here catch');
    throw Error(err);
  });
});
