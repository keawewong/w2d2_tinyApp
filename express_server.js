const Parse = require('body-parser')
const xp = require('express')
const app = xp()
const PORT = 3000

app.set('view engine', "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, resp) => {
  resp.send('Hello!')
})

app.get("/urls.json", (req, resp) => {
  resp.json(urlDatabase)
})

app.get('/urls', (req, resp) => {
  let templateVars = {urls: urlDatabase}
  resp.render('urls_index', templateVars)
})

app.get('/urls/new', (req, resp) => {
  resp.render('urls_new')
})

app.get('/urls/:id', (req, resp) => {
  let templateVars = {shortURL: req.params.id}
  resp.render('urls_show', templateVars)
})

app.use(Parse.urlencoded({extended: true}))

app.post('/urls', (req, resp) => {
  console.log(req.body)
  resp.send('Ok')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})
