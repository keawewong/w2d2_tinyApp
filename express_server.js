const RanStr = require('randomstring')
const Parse = require('body-parser')
const cookieS = require('cookie-session')
const bcrypt = require('bcrypt')
const xp = require('express')
const Request = require('request')
const app = xp()
const PORT = 3000

app.set('view engine', "ejs")

const cookieKey = generateRandomString(6)
app.use(cookieS({
    name: 'session',
    keys: [cookieKey],
    maxAge: 24 * 60 * 60 * 1000
  }

))

const urlDatabase = {
  "b2xVn2": {
    userID: 'user123456bear',
    url: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": {
    userID: 'user123456bear',
    url: "http://www.google.com"
  }
};

const users = {
  'user123456bear': {
    id: '123456bear',
    name: 'bear',
    email: 'bear',
    password: '$2a$10$wyPWXC/QwGsh3NgVf.pxOeVAmvfni6brjzvF17o3N0vIN01X3s2hq'
  }
}


app.get('/', (req, resp) => {
  let userKey = findUserKey('id', req.session.user_id)
  if (userKey) {
    let temp = tempObj('', '', req.session.user_id, 'index')
    resp.redirect(`/urls`)
    return
  }
  resp.redirect('/urls/login')
})

app.get("/urls.json", (req, resp) => {
  resp.json(urlDatabase)
})

// route to the registration page
app.get('/urls/register', (req, resp) => {
  let temp = tempObj('', '', '', 'register')
  resp.render('urls_register', { temp })
})

// route to the login page
app.get('/urls/login', (req, resp) => {
  let temp = tempObj('', '', '', 'login')
  resp.render('urls_login', { temp })
})

//  route to the index page
app.get('/urls', (req, resp) => {
  let userKey = findUserKey('id', req.session.user_id)
  if (userKey) {
    renderUrls_index(req.session.user_id, resp)
    return
  }
  resp.status(401).send(HTML_err('401', './login'));
})

// route to logout
app.get('/urls/logout', (req, resp) => {
  // resp.clearCookie('user_id')
  req.session = null
  renderUrls_index('', resp)
})

//route to form to enter new long url
app.get('/urls/new', (req, resp) => {
  if (req.session.user_id) {
    let temp = tempObj('', '', req.session.user_id, 'new')
    resp.render('urls_new', { temp })
    return
  }
  renderUrls_index('', resp)
})

//route to each short url page
app.get('/urls/:i', (req, resp) => {
  let userKey = findUserKey('id', req.session.user_id)
    // check user log-in
  if (!userKey) {
    resp.status(401).send(HTML_err('401', '/urls/login'));
    return
  }
  // valid short url
  let shortURL = req.params.i
  if (!urlDatabase[shortURL]) {
    resp.status(404).send(HTML_err('404', '/urls'));
    return
  }
  // check user owned url
  if (urlDatabase[shortURL].userID !== userKey) {
    resp.status(403).send(HTML_err('403', '/urls'));
    return
  }
  // all good
  let longURL = urlDatabase[shortURL].url
  let userName = ''
  let userID = (req.session.user_id ? req.session.user_id : '')
  let temp = tempObj(shortURL, longURL, userID, 'edit')
  resp.render('urls_show', { temp })
})

//route to the external long url
app.get("/u/:shortURL", (req, resp) => {
  // Validate short url
  if (urlDatabase[req.params.shortURL]) {
    resp.redirect(urlDatabase[req.params.shortURL].url)
    return
  }
  let userKey = findUserKey('id', req.session.user_id)
    // check user log-in
  if (!userKey) {
    resp.status(404).send(HTML_err('404', '/urls/login'));
    return
  }
  // Invalid short url for logged in user
  resp.status(404).send(HTML_err('404', '/urls'));
})

// ------Posts-------//

app.use(Parse.urlencoded({ extended: true }))

// route from the register button
app.post('/urls/register', (req, resp) => {

  let foundUserKey = findUserKey('email', req.body.email)
  let userKey = ''
  if (req.body.email && req.body.password && !foundUserKey) {
    let id = generateRandomString(10)
    let hashed_pwd = bcrypt.hashSync(req.body.password, 10)
    userKey = `user${id}`
    users[userKey] = {
      id: id,
      name: req.body.name,
      email: req.body.email,
      password: hashed_pwd
    }
    req.session.user_id = id
    renderUrls_index(id, resp)
    return
  }
  resp.redirect(400, '/urls/register')
})

// route from the login button
app.post('/urls/login', (req, resp) => {
  let foundUserKey = findUserKey('email', req.body.email)
  if (req.body.email && req.body.password && foundUserKey) {
    let hashed_pwd = users[foundUserKey].password
    if (bcrypt.compareSync(req.body.password, hashed_pwd)) {
      req.session.user_id = users[foundUserKey].id
      renderUrls_index(users[foundUserKey].id, resp)
      return
    }
  }
  resp.redirect(401, '/urls/login')
})

//route from submitting new url
app.post('/urls/new', (req, resp) => {
  if (req.session.user_id) {
    let userKey = findUserKey('id', req.session.user_id)
    let shortURL = generateRandomString(6)
    urlDatabase[shortURL] = { userID: {} }
    urlDatabase[shortURL].userID = userKey
    urlDatabase[shortURL].url = req.body.longURL
  }
  renderUrls_index(req.session.user_id, resp)
})

// route from the Delete button
app.post('/urls/:i/delete', (req, resp) => {
  delete urlDatabase[req.params.i]
  renderUrls_index(req.session.user_id, resp)
})

// route from the Update button
app.post('/urls/:i/update', (req, resp) => {
  urlDatabase[req.params.i].url = req.body.longURL
  renderUrls_index(req.session.user_id, resp)
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString(num) {
  return RanStr.generate(num)
}

// renders the index page
function renderUrls_index(cookie, resp) {
  let temp = tempObj('', '', cookie, 'index')
  let templateVars = { urls: urlDatabase, temp }
  resp.render('urls_index', templateVars)
}

// find the user's key by using any property and the value
function findUserKey(key, value) {
  for (user in users) {
    if (users[user][key] === value) return user

  }
}

// Make the temp obj to track user info
function tempObj(shortURL, longURL, userID, page) {
  let userName = ''
  let userKey = ''
  if (userID) {
    userKey = (findUserKey('id', userID) ? findUserKey('id', userID) : '')
    userName = (userKey ? users[userKey].name : '')
  }
  return { shortURL, longURL, userKey, userName, page }
}

//Make HTML error message and link for user to go somewhere
function HTML_err(code, dir) {
  code = Number(code)
  if (code === 401) {
    return `Please <a href='${dir}''>log in</a>.`
  }
  if (code === 403) {
    return `Sorry, can't find the url in your record. Return <a href='${dir}'>Home</a>.`
  }
  if (code === 404) {
    return `Sorry, can't find this short url. Return <a href='${dir}'>Home</a>.`
  }
}
