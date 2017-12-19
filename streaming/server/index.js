const express = require('express');
const fs = require('fs');
const mp3Duration = require('mp3-duration');
const aa = require('express-async-await');
const { queryDB } = require('../database/index.js');


const app = aa(express());

const path = 'server/assets/01 HeLLo (marshmello remix).mp3';


mp3Duration(path,  (err, duration) => {
  if (err) return console.log(err.message);
  console.log(duration)
  console.log(`Your file is ${duration / 60} minutes long`);
  const stat = fs.statSync(path); // Will need to add to DB
  const fileSize = stat.size;
  console.log(fileSize) // size in bytes
  console.log(`The bitrate is ${0.008 * fileSize/duration}`)
  console.log(`extra: ${fileSize % Math.floor(0.008 * fileSize/duration)}`); // send this extra on second reply
  console.log(`${0.008 * fileSize/duration * 10} bytes per 10 seconds`)
});
// new Buffer(size)

app.get('/:songId/:bytes', async (req, res, next) => {
// how many bytes are already loaded
  const [songInfo] = await queryDB(`SELECT * FROM songs WHERE id=${req.params.songId}`);
  const bitrate = Math.floor(8 * (songInfo.filesize / songInfo.duration));

  fs.open(songInfo.filepath, 'r', (status, fd) => {
    if (status) {
      return;
    }
    const startingByte = Number(req.params.bytes);
    let bufferLength = startingByte !== bitrate * 10 ?
      bitrate * 10 : (bitrate * 10) + (songInfo.filesize % bitrate);

    bufferLength = startingByte + bufferLength < songInfo.filesize ?
      bufferLength : songInfo.filesize - startingByte - 1;

    const buffer = new Buffer(bufferLength);

    fs.read(fd, buffer, 0, buffer.length, startingByte, (err, num) => {
      console.log(num)
      // write headers and such
      res.send(buffer);
    });
  });
});


const host = '0.0.0.0';
const port = 8080
app.listen(process.env.PORT || port, host, () => {
  console.log(`listening on port ${port}`);
});
