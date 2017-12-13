const express = require('express');
const fs = require('fs');


const app = express();


app.get('/', (req, res) => {
  const path = 'server/assets/awakening.mp3';
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const { range } = req.headers;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});


const host = '0.0.0.0';

app.listen(process.env.PORT || 8080, host, () => {
  console.log('listening on port 8080');
});
