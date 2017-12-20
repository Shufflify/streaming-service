// const cluster = require('cluster');
// // const AWS = require('aws-sdk');
//
// if (cluster.isMaster) {
//   const cpuCount = require('os').cpus().length;
//
//   // Create a worker for each CPU
//   for (let i = 0; i < cpuCount; i += 1) {
//       cluster.fork();
//   }
// } else {
const express = require('express');
const fs = require('fs');
const aa = require('express-async-await');
const { queryDB } = require('../database/index.js');
const { populate } = require('../database/index.js');

const app = aa(express());

app.get('/:songId/:bytes', async (req, res, next) => {
// how many bytes are already loaded
  const [songInfo] = await queryDB(`SELECT * FROM songs WHERE id=${req.params.songId}`);
  const bitrate = Math.floor(songInfo.filesize / (songInfo.duration / 1000));
  fs.open(songInfo.filepath, 'r', (status, fd) => {
    if (status) {
      return;
    }
    const startingByte = Number(req.params.bytes);
    let bufferLength = bitrate * 10;

    bufferLength = startingByte + bufferLength < songInfo.filesize ?
      bufferLength : songInfo.filesize - startingByte;

    const buffer = new Buffer(bufferLength);

    fs.read(fd, buffer, 0, buffer.length, startingByte, (err, num) => {
      const head = {
        'Content-Range': `bytes ${startingByte}-${startingByte + (buffer.length)}/${songInfo.filesize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': buffer.length,
        'Content-Type': 'audio/mpeg',
      };
      // below is calculation for the starting time of the song chunk IN SECONDS
      console.log(`${buffer.length} bytes sent`);
      // console.log(Math.floor((startingByte/(songInfo.filesize - (songInfo.filesize % bitrate))) * (songInfo.duration / 1000)));
      fs.close(fd, () => { console.log('closed'); });
      res.writeHead(206, head);
      res.end(buffer);
    });
  });
});

queryDB('SELECT count(*) as count FROM songs')
  .then((results) => {
    const n = process.env.RECORDS || 10000000; // in CL : RECORDS=*number* node server/index.js
    console.log(`${results[0].count} songs already in DB`);
    console.log(`${n - results[0].count} entires need to be added to the DB`);
    if (results[0].count < n) {
      populate(n - results[0].count);
    }
  });

const host = '0.0.0.0';

app.listen(process.env.PORT || 8080, host, () => { // in CL : PORT=*number* node server/index.js
  console.log(`listening on port ${process.env.PORT || 8080}`);
});
// }
