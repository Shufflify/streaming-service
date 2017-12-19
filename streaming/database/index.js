const mysql = require('mysql');
const Promise = require('bluebird');
const mp3Duration = require('mp3-duration');
const fs = require('fs');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shufflify',
});

const populate = async function (n) {
  const filepaths = [
    ['server/assets/01 Tennis Court (Flume Remix).mp3'],
    ['server/assets/01 HUMBLE. (Skrillex Remix).mp3'],
    ['server/assets/01 HeLLo (marshmello remix).mp3'],
    ['server/assets/EKALI x TROYBOI - TRUTH.mp3'],
  ];

  for (let path of filepaths) {
    const fileData = await fs.statSync(path[0]);
    path[1] = fileData.size;
    await mp3Duration(path[0],  (err, duration) => {
      path[2] = duration * 1000
      return;
    });
    // path[3] = Math.floor(8 * path[1]/path[2] * 1); //calculate bit rate
  }

  const arrPaths = [];
  for (let i = 0; i < n; i++) {
    arrPaths.push(filepaths[Math.floor(Math.random() * filepaths.length)]);
  }
  function insetStatement(filepath) {
    return function () {
      return new Promise((resolve, reject) => {
        const queryString = `INSERT INTO songs (filepath, duration, filesize)
        VALUES ('${filepath[0]}', ${filepath[2]}, ${filepath[1]})`;
        db.query(queryString, (err, results) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            if (results.insertId % 100000 === 0) {
              console.log(`${results.insertId} results added to DB`);
            }
            resolve(filepath);
          }
        });
      });
    };
  }

  const funcs = Promise.resolve(arrPaths.map((path) => insetStatement(path)));

  function iterator(f) {
    return f()
  }

  funcs
    .mapSeries(iterator)
    .then((res) => {console.log(`Added ${res.length} entries to DB`); });
};

const queryDB = function (queryString, callback) {
  db.query(queryString, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports.queryDB = Promise.promisify(queryDB);
module.exports.populate = populate;
