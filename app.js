const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const crypto = require("crypto")
const port = 3000

app.use(cookieParser())
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { text: 'ejsテスト'});
});

app.get('/oauth/authorize', (req, res) => {
  res.cookie('sessionId', crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax"
  });
  res.render('oauth/authorize');
})

app.post('/oauth/login', (req, res) => {
  console.log(req.cookies);
  res.redirect(`myapp://net.jp.vss.flutter-auth/auth-callback?code=${crypto.randomUUID()}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

