const RanStr = require('randomstring')
const Parse = require('body-parser')
const cookie = require('cookie-parser')
const bcrypt = require('bcrypt')
const xp = require('express')
const Request = require('request')
const app = xp()
const PORT = 3000

app.set('view engine', "ejs")
app.use(cookie())

const urlDatabase = {
  "b2xVn2": {
    userID: 'user123456keawe',
    url: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": {
    userID: 'user123456keawe',
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
  resp.send(`Hello!`)
  console.log(req.cookies.user_id)
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
  renderUrls_index(req.cookies.user_id, resp)
})

// route to logout
app.get('/urls/logout', (req, resp) => {
  resp.clearCookie('user_id')
  renderUrls_index('', resp)
})

//route to form to enter new long url
app.get('/urls/new', (req, resp) => {
  if (req.cookies.user_id) {
    let temp = tempObj('', '', req.cookies.user_id, 'new')
    resp.render('urls_new', { temp })
    return
  }
  renderUrls_index('', resp)
})

//route to each short url page
app.get('/urls/:i', (req, resp) => {
  let shortURL = req.params.i
  let longURL = urlDatabase[shortURL].url
  let userName = ''
  let userID = (req.cookies.user_id ? req.cookies.user_id : '')
  let temp = tempObj(shortURL, longURL, userID, 'edit')
  resp.render('urls_show', { temp })
})

//route to the external long url
app.get("/u/:shortURL", (req, resp) => {
  resp.redirect(req.params.i)
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
      // password: req.body.password
      password: hashed_pwd
    }
    console.log(users)
    resp.cookie('user_id', id)
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
      // console.log(`hashed: ${hashed_pwd}`)
    if (bcrypt.compareSync(req.body.password, hashed_pwd)) {
      // if (req.body.password === users[foundUserKey].password) {
      resp.cookie('user_id', users[foundUserKey].id)
      renderUrls_index(users[foundUserKey].id, resp)
      return
    }
  }
  resp.redirect(403, '/urls/login')
})

//route from submitting new url
app.post('/urls/new', (req, resp) => {
  if (req.cookies.user_id) {
    let userKey = findUserKey('id', req.cookies.user_id)
    let shortURL = generateRandomString(6)
    urlDatabase[shortURL] = { userID: {} }
    urlDatabase[shortURL].userID = userKey
    urlDatabase[shortURL].url = req.body.longURL
  }
  renderUrls_index(req.cookies.user_id, resp)
})

// route from the Delete button
app.post('/urls/:i/delete', (req, resp) => {
  delete urlDatabase[req.params.i]
  renderUrls_index(req.cookies.user_id, resp)
})

// route from the Update button
app.post('/urls/:i/update', (req, resp) => {
  urlDatabase[req.params.i].url = req.body.longURL
  renderUrls_index(req.cookies.user_id, resp)
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString(num) {
  return RanStr.generate(num)
}

function renderUrls_index(cookie, resp) {
  let temp = tempObj('', '', cookie, 'index')
  let templateVars = { urls: urlDatabase, temp }
  resp.render('urls_index', templateVars)
}

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
