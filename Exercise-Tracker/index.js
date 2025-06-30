const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
const crypto = require('crypto');
require('dotenv').config()

// #note -> i will add monngoDB later currently i am using in memory storage
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const allUsers = [];
const logs = [];
app.get('/api/users', (req, res) => {
  res.json(allUsers);
})

function generateObjectId() {
  return crypto.randomBytes(12).toString('hex'); //its magic
}
app.post('/api/users', (req, res) => {
  console.log(req.body);
  const uname = req.body.username;

  if (!uname) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const user = {
    username: uname,
    _id: generateObjectId()
  };
  allUsers.push(user);
  
  res.json(user);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const user = allUsers.find(u => u._id === _id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  const { description, duration, date } = req.body;

  const durationInt = parseInt(duration);
  if (isNaN(durationInt)) {
    return res.status(400).json({ error: 'Duration must be a number' });
  }

  const log = {
    _id: user._id,
    username: user.username,
    date: new Date(date || Date.now()).toDateString(),
    duration: durationInt,
    description
  };

  logs.push(log);
  res.json(log);
});


app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const user = allUsers.find(u => u._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Optional query params: from, to, limit
  const { from, to, limit } = req.query;
  let userLogs = logs.filter(log => log._id === _id);

  // filter by date range if provided
  if (from) {
    const fromDate = new Date(from);
    userLogs = userLogs.filter(log => new Date(log.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userLogs = userLogs.filter(log => new Date(log.date) <= toDate);
  }

  // Limit the number of logs returned
  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: userLogs.length,
    log: userLogs.map(({ description, duration, date }) => ({
      description,
      duration,
      date
    }))
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
