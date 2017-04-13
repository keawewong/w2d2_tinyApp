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

const temp = {
  shortURL: '',
  longURL: '',
  user_id: '',
  warn: ''
}

const users = {
  user123456keawe: {
    id: '123456keawe',
    name: '',
    email: '',
    password: ''
  }
}


app.get('/', (req, resp) => {
  resp.send(`Hello!`)
})

app.get("/urls.json", (req, resp) => {
  resp.json(urlDatabase)
})

// route to the registration page
app.get('/urls/register', (req, resp) => {
  resp.render('urls_register')
})

//  route to the index page
app.get('/urls', (req, resp) => {
  renderUrls_index(resp)
})

//route to form to enter new long url
app.get('/urls/new', (req, resp) => {
  resp.render('urls_new', { temp })
})

//route to each short url page
app.get('/urls/:i', (req, resp) => {
  updateTempURL(req.params.i)
  resp.render('urls_show', { temp })
})

//route to the external long url
app.get("/u/:shortURL", (req, resp) => {
  updateTempURL(req.params.i)
  resp.redirect(temp.longURL)
})

// ------Posts-------//

app.use(Parse.urlencoded({ extended: true }))

// route from the register button
app.post('/urls/register', (req, resp) => {
  if (req.body.email && req.body.password) {
    let user_id = `user${generateRandomString(10)}`
    users[user_id] = {
      id: user_id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    }
    temp.user_id = users[user_id].name
    resp.cookie('user_id', user_id)
    resp.redirect('/urls')

  }
})

//route from submitting new url
app.post('/urls/new', (req, resp) => {
  temp.shortURL = generateRandomString(6)
  temp.longURL = req.body.longURL
  urlDatabase[temp.shortURL] = temp.longURL
  renderUrls_index(resp)
})

// route from the Delete button
app.post('/urls/:i/delete', (req, resp) => {
  delete urlDatabase[req.params.i]
  renderUrls_index(resp)
})

// route from the Update button
app.post('/urls/:i/update', (req, resp) => {
  urlDatabase[req.params.i] = req.body.longURL
  renderUrls_index(resp)
})

// route from the login button
app.post('/urls/login', (req, resp) => {
  temp.user_id = req.body.username
  resp.clearCookie('name', temp.user_id)
  renderUrls_index(resp)
})

// route from the logout button
app.post('/urls/logout', (req, resp) => {
  temp.user_id = ''
  resp.cookie('name', temp.user_id)
  renderUrls_index(resp)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString(num) {
  return RanStr.generate(num)
}

function updateTempURL(shortURL) {
  temp.shortURL = shortURL
  temp.longURL = urlDatabase[temp.shortURL]

}

function renderUrls_index(resp) {
  let templateVars = { urls: urlDatabase, temp }
  resp.render('urls_index', templateVars)
}
