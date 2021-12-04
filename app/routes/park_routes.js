// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Park = require('../models/park')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /parks
router.get('/parks', requireToken, (req, res, next) => {
  Park.find()
    // respond with status 200 and JSON of national parks
    .then(parks => res.status(200).json({ parks }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /parks/:id
router.get('/parks/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Park.findById(req.params.id)
    .then(handle404)
    // if `findById` is successful, respond with 200 and "example" JSON
    .then(park => res.status(200).json({ park }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /park
router.post('/parks', requireToken, (req, res, next) => {
  // set owner of new example to be current user
  req.body.park.owner = req.user.id

  Park.create(req.body.park)
    // respond to successful `create` with status 201 and JSON of new "example"
    .then(park => {
      res.status(201).json({ park })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /parks/:id
router.patch('/parks/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.park.owner

  Park.findById(req.params.id)
    .then(handle404)
    // ensure the signed in user (req.user.id) is the same as the example's owner (example.owner)
    .then(park => requireOwnership(req, park))
    // updating example object with exampleData
    .then(park => park.updateOne(req.body.park))
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /parks/:id
router.delete('/parks/:id', requireToken, (req, res, next) => {
  Park.findById(req.params.id)
    .then(handle404)
     // ensure the signed in user (req.user.id) is the same as the example's owner (example.owner)
    .then(park => requireOwnership(req, park))
    // delete example from mongodb
    .then(park => park.deleteOne())
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
