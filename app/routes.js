const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/'); // Redirect to home if not an admin
}

module.exports = function(app, passport, isAuthenticated) {
    // Home page route
    app.get('/', async (req, res) => {
        try {
            // Fetch events from the database
            const [events] = await pool.query('SELECT * FROM events');
            res.render('home', { 
                isAuthenticated: req.isAuthenticated(), 
                user: req.user, 
                events,
    
            });
        } catch (error) {
            console.error('Error fetching events from database:', error);
            res.status(500).send('Server error');
        }
    });

    app.get('/about',async(req,res)=>{
        res.render('about')
    })
    app.get('/events',async(req,res)=>{
        res.render('events')
    })
    app.get('/event',async(req,res)=>{
        res.render('event')
    })
    app.get('/speakers',async(req,res)=>{
        res.render('speakers')
    })
    app.get('/category',async(req,res)=>{
        res.render('category')
    })
    app.get('/404',async(req,res)=>{
        res.render('404')
    })
    app.get('/contact',async(req,res)=>{
        res.render('contact')
    })

    // Register route
    app.get('/register/:eventId', (req, res) => {
        const eventId = req.params.eventId;
        res.render('register.ejs', { eventId }); // Pass eventId to the EJS template
    });
    
    // Event details route
    app.get('/event-details/:eventId', async (req, res) => {
        const eventId = req.params.eventId;
        try {
            const [eventDetails] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
            if (eventDetails.length === 0) {
                return res.status(404).send('Event not found');
            }
            res.render('event-details.ejs', { event: eventDetails[0],eventId }); // Pass event details to the EJS template
        } catch (error) {
            console.error('Error fetching event details:', error);
            res.status(500).send('Server error');
        }
    });
    
    app.post('/submit-registration', async (req, res) => {
        const { eventId, name, email } = req.body;
    
        try {
            const [result] = await pool.query(
                'INSERT INTO registrations (event_id, name, email) VALUES (?, ?, ?)',
                [eventId, name, email]
            );
    
            res.send('Registration successful!');
        } catch (error) {
            console.error('Error inserting registration:', error);
            res.status(500).send('Server error');
        }
    });

    // Login routes
    app.get('/login', (req, res) => {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/login', (req, res, next) => {
        passport.authenticate('local-login', async (err, user, info) => {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }

            req.logIn(user, async (err) => {
                if (err) { return next(err); }

                // Redirect based on user role
                if (user.role === 'admin') {
                    return res.redirect('/manage-agenda'); // Redirect admin to manage-agenda
                } else if (req.session.returnTo) {
                    const redirectUrl = req.session.returnTo;
                    delete req.session.returnTo;
                    return res.redirect(redirectUrl); // Redirect to the originally requested URL
                } else {
                    return res.redirect('/'); // Default redirect for regular users
                }
            });
        })(req, res, next);
    });

    // Signup routes
    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    // Logout route
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/recolte', isAuthenticated, (req, res) => {
        res.render('recolte.ejs');
    });

    // Agenda display route
    app.get('/stades', isAuthenticated, async (req, res) => {
        try {
            const [agendaItems] = await pool.query('SELECT * FROM olive_agenda');
            res.render('stades.ejs', {
                agendaItems,
                user: req.user // Pass the user object to the template
            });
        } catch (error) {
            console.error('Error fetching data from database:', error);
            res.status(500).send('Server error');
        }
    });

    // Management page route
    app.get('/manage-agenda', isAdmin, async (req, res) => {
        try {
            const [agendaItems] = await pool.query('SELECT * FROM olive_agenda');
            res.render('manage_agenda.ejs', {
                agendaItems,
                user: req.user // Pass the user object to the template
            });
        } catch (error) {
            console.error('Error fetching data from database:', error);
            res.status(500).send('Server error');
        }
    });

    // Add new agenda item
    app.post('/manage-agenda/add', isAdmin, async (req, res) => {
        const { image_url, month, change_name } = req.body;
        try {
            await pool.query('INSERT INTO olive_agenda (image_url, month, change_name) VALUES (?, ?, ?)', [image_url, month, change_name]);
            res.redirect('/manage-agenda');
        } catch (error) {
            console.error('Error adding agenda item:', error);
            res.status(500).send('Server error');
        }
    });

    // Delete agenda item
    app.post('/manage-agenda/delete/:id', isAdmin, async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM olive_agenda WHERE id = ?', [id]);
            res.redirect('/manage-agenda');
        } catch (error) {
            console.error('Error deleting agenda item:', error);
            res.status(500).send('Server error');
        }
    });

    // Update agenda item
    app.post('/manage-agenda/edit/:id', isAdmin, async (req, res) => {
        const { id } = req.params;
        const { image_url, month, change_name } = req.body;
        try {
            await pool.query('UPDATE olive_agenda SET image_url = ?, month = ?, change_name = ? WHERE id = ?', [image_url, month, change_name, id]);
            res.redirect('/manage-agenda');
        } catch (error) {
            console.error('Error updating agenda item:', error);
            res.status(500).send('Server error');
        }
    });

    app.get('/change-password', isAuthenticated, (req, res) => {
        if (req.user.role === 'admin') {
            res.render('change-password'); // Make sure you have a view for this
        } else {
            res.redirect('/'); // Or some other page if the user is not admin
        }
    });
    
    app.post('/change-password', isAuthenticated, async (req, res) => {
        if (req.user.role !== 'admin') {
            return res.redirect('/');
        }

        const { currentPassword, newPassword } = req.body;

        console.log('Current Password:', currentPassword);
        console.log('New Password:', newPassword);

        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
            const user = rows[0];

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            console.log('Password Match:', isMatch);

            if (!isMatch) {
                req.flash('error', 'Current password is incorrect');
                return res.redirect('/change-password');
            }

            const hash = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

            req.flash('success', 'Password updated successfully');
            res.redirect('/');
        } catch (err) {
            console.error('Error changing password:', err);
            req.flash('error', 'An error occurred while changing the password');
            res.redirect('/change-password');
        }
    });
};
