const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

// Simple Kitchen home page
router.get('/', (req, res) => {
  res.render('index', { title: 'Simple Kitchen' });
});

// The new registration form
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Validate, save, then show the thank you page
router.post('/register',
  [
    check('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    check('email')
      .isLength({ min: 1 })
      .withMessage('Please enter an email'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const registration = new Registration(req.body);
            registration.save()
        .then(() => { res.redirect('/thankyou'); })
        .catch((err) => {
          console.log(err);
          res.send('Sorry! Something went wrong.');
        });
    } else {
      res.render('register', {
        title: 'Register',
        errors: errors.array(),
        data: req.body,
      });
    }
  });

// Listing of registrants (password protected)
router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', {
        title: 'Listing registrants',
        registrations,
        hideIntro: true,
      });
    })
    .catch(() => {
      res.send('Sorry! Something went wrong.');
    });
}));

// Thank you page (a plain GET, so reloading does not save again)
router.get('/thankyou', (req, res) => {
  res.render('thankyou', { title: 'Thank you' });
});

module.exports = router;
