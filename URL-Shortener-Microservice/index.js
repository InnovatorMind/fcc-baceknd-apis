require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urls = []; 


app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }
  const found = urls.find(entry => entry.original_url === originalUrl);
  if (found) {
    return res.json(found);
  }

  const shortUrl = urls.length + 1;
  const newEntry = { original_url: originalUrl, short_url: shortUrl };
  urls.push(newEntry);

  res.json(newEntry);
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const found = urls.find(entry => entry.short_url === shortUrl);

  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.status(404).json({ error: 'Short URL not found' });
  }
});

//first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
