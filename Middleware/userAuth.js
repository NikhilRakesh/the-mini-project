const signupSchema = require('../modal/signupSchema')

// user block middelware
const userBlocked = async (req, res, next) => {

  if (req.session.user) {
    const userId = req.session.user._id;

    user = await signupSchema.findById(userId);

    if (user.blocked) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.redirect('/home');
      });
    } else {
      next();
    }
  } else {
    next()
  }

}


// user session middleware
const userSessionMiddleare = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/home');
  }
}



module.exports = {  userBlocked,userSessionMiddleare }
