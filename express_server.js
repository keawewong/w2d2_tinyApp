const RanStr = require('randomstring')
const Parse = require('body-parser')
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
  let templateVars = { urls: urlDatabase }
  resp.render('urls_index', templateVars)
})

//route to form to enter new long url
app.get('/urls/new', (req, resp) => {
  resp.render('urls_new')
})

//route to each short url page
app.get('/urls/:id', (req, resp) => {
  getLongURL(req.params.i)
  resp.render('urls_show', temp)
})

//route to the external long url
app.get("/u/:shortURL", (req, resp) => {
  getLongURL(req.params.i)
  resp.redirect(temp.longURL)
})

app.use(Parse.urlencoded({ extended: true }))

//route to the form after submit
app.post('/urls', (req, resp) => {
  temp.shortURL = generateRandomString()
  temp.longURL = req.body.longURL
  urlDatabase[temp.shortURL] = temp.longURL
  resp.render('urls_show', temp)
})

// route from the Delete button
app.post('/urls/:i/delete', (req, resp) => {
  getLongURL(req.params.i)
  delete(urlDatabase[temp.shortURL])
  console.log(urlDatabase)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})

function generateRandomString() {
  return RanStr.generate(6)
}

function getLongURL(shortURL) {
  temp.shortURL = shortURL
  temp.longURL = urlDatabase[temp.shortURL]

}
