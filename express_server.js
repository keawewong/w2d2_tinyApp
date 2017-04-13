const RanStr = require('randomstring')
const Parse = require('body-parser')
const cookie = require('cookie-parser')
const xp = require('express')
const Request = require('request')
const app = xp()
const PORT = 3000

app.set('view engine', "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const temp = {
  shortURL: '',
  longURL: '',
  user: '',
  warn: ''
}


app.get('/', (req, resp) => {
  resp.send(`Hello!`)
})

app.get("/urls.json", (req, resp) => {
  resp.json(urlDatabase)
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

app.use(Parse.urlencoded({ extended: true }))

//route from submitting new url
app.post('/urls/new', (req, resp) => {
  temp.shortURL = generateRandomString()
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
  temp.user = req.body.username
  resp.cookie('name', temp.user)
  renderUrls_index(resp)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString() {
  return RanStr.generate(6)
}

function updateTempURL(shortURL) {
  temp.shortURL = shortURL
  temp.longURL = urlDatabase[temp.shortURL]

}

function renderUrls_index(resp) {
  let templateVars = { urls: urlDatabase, temp }
  resp.render('urls_index', templateVars)
}
