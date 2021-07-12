const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const randomstring = require('randomstring');
const exphbs = require('express-handlebars');
const dao = require('./dao');
const sessions = require('client-sessions');
const app = express();

const SECRET = randomstring.generate();


const hbs = exphbs.create({
    extname: "hbs",
    defaultLayout: 'main.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(sessions({
    secret: SECRET,
    cookieName: 'mySession',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5
}));

function auth(req, res, next) {
    
    if (!sessions.username ) {
        let msg = "you can't access this page because you are not log in!";
        res.render('login', {data: msg});
    } 
    else {
        next();
    }
}

app.get('/',  (req, res, next) => {
    res.render('login');
})

app.post('/', (req, res, next) => {
    let { userName, password } = req.body;
    let user = {};
    user["name"] = userName;
    user["password"] = password;

    dao.login(user, function (msg, user) {
        if (user) {
            sessions.username = user.name;
            res.redirect('/gallery');
        } else {
            res.render('login', { data: msg["msg"] })

        }

    })
})

app.get('/logout', (req, res, next) => {
    sessions.username=null;
    res.redirect('/');
})
app.get('/signup', (req, res, next) => {
    res.render('signup', { data: " " });
})

app.post('/signup', (req, res, next) => {
    let { userName, password,confirmPassword } = req.body;
    console.log(req);
    if (password != confirmPassword){
        let msg = "password and confirmPassword are not same!";
        res.render('signup', { data: msg });
    }else{
        let user = {};
        user["name"] = userName;
        user["password"] = password;
        dao.update(user, function (msg) {
            if (msg["error"] === '1') {
                res.render('signup', { data: msg["msg"]});
            }else{
                res.redirect('/');
            }
            
        });
    }
    
    
})

app.get('/gallery',auth, (req, res, next) => {
    dao.read(
        function (data) {
            res.render('index', { flowers: data, flower: 'nationalflowers', username: sessions.username});
    }
    
    );
})

app.post('/gallery', auth,  (req, res, next) => {
    dao.read(function (data) {
        res.render('index', { flowers: data, flower: req.body.rdoImage, username: sessions.username });
    });
})


app.get('*', (req, res, next) => {
    res.send("FAILED! Fix your URL.");
})

app.use((err, req, res, next) => {
    if (err) {
        res.status(500).json({
            message: err.message
        })

    }
})

app.listen(3000, () => {
    console.log('Listening on port 3000')

})