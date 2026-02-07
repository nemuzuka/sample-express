const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const crypto = require("crypto")
const port = 3000

app.use(cookieParser())
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { text: 'ejsテスト'});
});

// ↓ 本来は IdP 側のエンドポイント
app.get('/oauth/authorize', (req, res) => {
  res.cookie('sessionId', crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax"
  });
  console.log(`/oauth/authorize query params:`);
  console.log(req.query)
  res.render('oauth/authorize');
})

app.post('/oauth/login', (req, res) => {
  console.log(`/oauth/login cookies:`);
  console.log(req.cookies);
  res.redirect(`myapp://net.jp.vss.flutter-auth/auth-callback?code=${crypto.randomUUID()}`);
});

// ↑ 本来は IdP 側のエンドポイント

app.post('/oauth/token', (req, res)=>{
  console.log(`/oauth/token request parameters:`);
  console.log(req.body);
  // 本来は、パラメータを元に Token エンドポイントを呼び出し、IdP からトークンを取得し、
  // BFF 固有のトークンを作成する
  res.json({
    bffToken:`BFF-${crypto.randomUUID()}`
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
