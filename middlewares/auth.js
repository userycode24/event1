const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'You need to be logged in to access this page.');
    res.redirect('/login');
  };
  
  const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'You need to be an admin to access this page.');
    res.redirect('/');
  };
  
  module.exports = { isAuthenticated, isAdmin };
  