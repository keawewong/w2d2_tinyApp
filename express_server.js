const RanStr = require('randomstring')
const Parse = require('body-parser')
const cookie = require('cookie-parser')
const xp = require('express')
const Request = require('request')
const app = xp()
const PORT = 3000

app.set('view engine', "ejs")
app.use(cookie())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  user123456keawe: {
    id: '123456keawe',
    name: 'Keawe',
    email: 'email',
    password: 'pwd'
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

//route to form to enter new long url
app.get('/urls/new', (req, resp) => {
  let userKey = findUserKey('id', req.cookies.user_id)
  let temp = tempObj('', '', users[userKey].name, 'new')
  resp.render('urls_new', { temp })
})

//route to each short url page
app.get('/urls/:i', (req, resp) => {
  let shortURL = req.params.i
  let longURL = urlDatabase[req.params.i]
  let userKey = findUserKey('id', req.cookies.user_id)
  let temp = tempObj(shortURL, longURL, users[userKey].name, 'edit')
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
    userKey = `user${id}`
    users[userKey] = {
      id: id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    }
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
    if (req.body.password === users[foundUserKey].password) {
      resp.cookie('user_id', users[foundUserKey].id)
      renderUrls_index(users[foundUserKey].id, resp)
      return
    }
  }
  resp.redirect(403, '/urls/login')
})

//route from submitting new url
app.post('/urls/new', (req, resp) => {
  let shortURL = generateRandomString(6)
  urlDatabase[shortURL] = req.body.longURL
  renderUrls_index(req.cookies.user_id, resp)
})

// route from the Delete button
app.post('/urls/:i/delete', (req, resp) => {
  delete urlDatabase[req.params.i]
  renderUrls_index(req.cookies.user_id, resp)
})

// route from the Update button
app.post('/urls/:i/update', (req, resp) => {
  urlDatabase[req.params.i] = req.body.longURL
  renderUrls_index(req.cookies.user_id, resp)
})


// route from the logout button
app.post('/urls/logout', (req, resp) => {
  resp.clearCookie('user_id')
  renderUrls_index('', resp)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString(num) {
  return RanStr.generate(num)
}

function renderUrls_index(cookie, resp) {
  let userName = '',
    userKey = ''
  if (cookie) {
    userKey = findUserKey('id', cookie)
    userName = (userKey ? users[userKey].name : '')
  }
  let temp = tempObj('', '', userName, 'index')
  let templateVars = { urls: urlDatabase, temp }
  resp.render('urls_index', templateVars)
}

function findUserKey(key, value) {
  for (user in users) {
    if (users[user][key] === value) return user

  }
}

// Make the temp obj to track user info
function tempObj(shortURL, longURL, userName, page) {
  return { shortURL, longURL, userName, page }
}
