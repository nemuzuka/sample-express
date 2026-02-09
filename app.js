const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const crypto = require("crypto")
const port = 3000
const { fetchToken } = require('./client/token_endpoint');
const { generateToken, decodeToken } = require('./utils/token_util');

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

app.post('/oauth/token', async (req, res)=>{
  console.log(`/oauth/token request parameters:`);
  console.log(req.body);

  const tokenResponse = await fetchToken(req.body.code, req.body.codeVerifier);
  console.log(`/oauth/token response:`, tokenResponse);
  const token = generateToken(tokenResponse.refresh_token, `ユーザー${crypto.randomUUID()}`);

  // 本来は、パラメータを元に Token エンドポイントを呼び出し、IdP からトークンを取得し、
  // BFF 固有のトークンを作成する
  res.json({
    bffToken:token
  });
});

app.get(`/api/user-info`, verifyToken, (req, res)=>{
  res.json({username: req.token.username});
});

function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");
  if(authHeader !== undefined) {
    const splitedHeader = authHeader.split(" ");
    if(splitedHeader.length !== 2) {
      const error = new Error("認証トークンが不正です");
      error.status = 401;
      return next(error);
    }

    // 本来は token が正しいとか有効期限とかのチェックを行う
    // 有効期限が切れていたら BFF トークンを再発行するとかもここで行う
    const token = splitedHeader[1];
    req.token = decodeToken(token);
    console.log(`token: ${token}`);
    next();
  } else {
    const error = new Error("認証トークンがありません");
    error.status = 401;
    return next(error);
  }
}

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "サーバー内部エラー",
      status: status
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
