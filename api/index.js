const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const bcryptSecret = bcrypt.genSaltSync(12);
const jwtSecret = 'hkHkkbhk8a9adkawrwr563';
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));

mongoose.connect(process.env.MONGO_URL);
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const createdUser = await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcryptSecret)
    })
    res.json({ createdUser });
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });


    if (user) {
        const isPassword = bcrypt.compareSync(password, user.password);
        if (isPassword) {

            jwt.sign({
                email: user.email,
                id: user._id
            }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(user);
            });

        } else {
            res.json('incorrect password');
        }
    } else {
        res.json('user not found');

    }

})
app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json(true);
});

app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, tokenData) => {
            if (err) throw err;
            const { name, email, id } = await User.findById(tokenData.id);
            res.json({ name, email, id });
        })
    }
})


app.listen(4000)