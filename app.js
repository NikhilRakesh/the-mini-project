const express = require('express')
const app = express()
const userrouter = require('./routes/userrouter')
const adminrouter = require('./routes/adminrouter')
const productrouter = require('./routes/productrouter')
const couponrouter = require('./routes/couponrouter')
const walletrouter = require('./routes/walletrouter')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { v4: uuid4 } = require("uuid");
require('dotenv').config();

const dbURI = process.env.DB_URI;

app.set('view engine', 'ejs')

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    name: 'sessions',
    secret: uuid4(),
    resave: false,
    saveUninitialized: false,
    store: '',
    cookie: {
      maxAge: 3600000,
    },
  })
);  

const noCacheMiddleware = (req, res, next) => {
  console.log('cache');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
  next();
};
   
app.use(noCacheMiddleware);

app.use('/',productrouter)
app.use('/',userrouter)
app.use('/',adminrouter)
app.use('/',couponrouter)  
app.use('/',walletrouter)



mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('database connected');
      app.listen(7000, () => {
        console.log('server started');
      })
    })
    .catch((err) => {
      console.error('Error connecting to the database:', err);
    })  