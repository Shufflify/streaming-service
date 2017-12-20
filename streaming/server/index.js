const express = require('express');
const fs = require('fs');
const mp3Duration = require('mp3-duration');
const aa = require('express-async-await');
const { queryDB } = require('../database/index.js');
const { populate } = require('../database/index.js');
// const AWS = require('aws-sdk');


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
      bufferLength : songInfo.filesize - startingByte - 1;

    const buffer = new Buffer(bufferLength);

    fs.read(fd, buffer, 0, buffer.length, startingByte, (err, num) => {
      const head = {
        'Content-Range': `bytes ${startingByte}-${startingByte + (buffer.length - 1)}/${songInfo.filesize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': buffer.length,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(206, head);
      res.end(buffer);
    });
  });
});

queryDB('SELECT count(*) as count FROM songs')
  .then((results) => {
    const n = 100000;
    console.log(results[0].count)
    console.log(`${n - results[0].count} entires need to be added to the DB`);
    if (results[0].count < n) {
      populate(n - results[0].count);
    }
  });

const host = '0.0.0.0';
const port = 8080
app.listen(process.env.PORT || port, host, () => {
  console.log(`listening on port ${port}`);
});
