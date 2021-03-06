const express = require('express')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const router = express.Router()

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

// To start database run:
// "sudo service postgresql start"
// then run from database directory:
// "psql -U marcel97 -d marcel97 -a -f <file.sql>"

const HttpStatusCodes = {
  OK: 200,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
}

const dbConfiguration = {
  host: 'localhost',
  port: 5432,
  user: 'marcel97',
  password: 'databaza123',
  database: 'marcel97',
}

const pgp = require('pg-promise')(/*options*/)
const db = pgp(dbConfiguration)

const sampleRequest = (req, res, next) => {
  res.json('Nothing here!')
}

const registerUser = async (req, res) => {
  const user = req.body
  const {name, surname, email, password} = user
  // TODO: check for existing email in database
  await db.none('INSERT INTO users (name, surname, email, password) VALUES ($1, $2, $3, $4)', [
    name,
    surname,
    email,
    password,
  ])
  res.status(HttpStatusCodes.OK).send()
}

const getUsers = async (req, res) => {
  const users = await db.any('SELECT * FROM users')
  res.status(HttpStatusCodes.OK).json(users)
}

const getUserIdFromEmail = async (email) => {
  const data = await db.one('SELECT id from users WHERE email = $1', email)
  return data.id
}

const addBoarder = async (req, res) => {
  const {user, boarder} = req.body
  const userId = await getUserIdFromEmail(user.email)
  const {name, surname, diet} = boarder
  await db.none('INSERT INTO boarders (user_id, name, surname, diet) VALUES ($1, $2, $3, $4)', [
    userId,
    name,
    surname,
    diet,
  ])
  res.status(HttpStatusCodes.OK).send()
}

const getBoarders = async (req, res) => {
  const {email} = req.query
  if (email) {
    const userId = await getUserIdFromEmail(email)
    const boarders = await db.any('SELECT * FROM boarders WHERE user_id = $1', userId)
    res.status(HttpStatusCodes.OK).json(boarders)
  } else {
    const boarders = await db.any('SELECT * FROM boarders')
    res.status(HttpStatusCodes.OK).json(boarders)
  }
}

const setMenu = async (req, res) => {
  const oldMenu = await readFile(path.join(__dirname, '..', 'data', 'menu.txt'))
  await writeFile(path.join(__dirname, '..', 'data', 'stareMenu.txt'), oldMenu)
  await writeFile(path.join(__dirname, '..', 'data', 'menu.txt'), JSON.stringify(req.body))
  res.status(HttpStatusCodes.OK).send()
}

const getMenu = async (req, res) => {
  const data = await readFile(path.join(__dirname, '..', 'data', 'menu.txt'))
  res.status(HttpStatusCodes.OK).json(JSON.parse(data.toString()))
}

const saveMenuChoices = async (req, res) => {
  const {menuChoices, boarderId, week} = req.body
  await db.none('INSERT INTO menus (boarder_id, week, choices) VALUES ($1, $2, $3)', [
    boarderId,
    week,
    menuChoices,
  ])
  res.status(HttpStatusCodes.OK).send()
}

const getMenuChoices = async (req, res) => {
  const menuChoices = await db.any('SELECT * FROM menus')
  res.status(HttpStatusCodes.OK).json(menuChoices)
}

const saveNotice = async (req, res) => {
  await writeFile(path.join(__dirname, '..', 'data', 'upozornenia.txt'), req.body.notice)
  res.status(HttpStatusCodes.OK).send()
}

const getNotice = async (req, res) => {
  const data = await readFile(path.join(__dirname, '..', 'data', 'upozornenia.txt'))
  res.status(HttpStatusCodes.OK).send(data.toString())
}

const removeUser = async (req, res) => {
  const {userId} = req.params
  await db.none('DELETE FROM users WHERE id = $1', userId)
  res.status(HttpStatusCodes.OK).send()
}

const removeBoarder = async (req, res) => {
  const {boarderId} = req.params
  await db.none('DELETE FROM boarders WHERE id = $1', boarderId)
  res.status(HttpStatusCodes.OK).send()
}

const getOldMenu = async (req, res) => {
  const data = await readFile(path.join(__dirname, '..', 'data', 'stareMenu.txt'))
  res.status(HttpStatusCodes.OK).json(JSON.parse(data.toString()))
}

const savePrices = async (req, res) => {
  await writeFile(path.join(__dirname, '..', 'data', 'ceny.txt'), JSON.stringify(req.body.prices))
  res.status(HttpStatusCodes.OK).send()
}

const getPrices = async (req, res) => {
  const data = await readFile(path.join(__dirname, '..', 'data', 'ceny.txt'))
  res.status(HttpStatusCodes.OK).json(JSON.parse(data))
}

router.get('/', sampleRequest)
router.post('/register', registerUser)
router.get('/users', getUsers)
router.post('/boarder', addBoarder)
router.get('/boarders', getBoarders)
router.get('/menu', getMenu)
router.post('/menu', setMenu)
router.post('/menuChoices', saveMenuChoices)
router.get('/menuChoices', getMenuChoices)
router.post('/notice', saveNotice)
router.get('/notice', getNotice)
router.delete('/users/:userId', removeUser)
router.delete('/boarders/:boarderId', removeBoarder)
router.get('/oldMenu', getOldMenu)
router.post('/prices', savePrices)
router.get('/prices', getPrices)

module.exports = router
