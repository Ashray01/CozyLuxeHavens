const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
require('dotenv').config();
const app = express();
const bcryptSecret = bcrypt.genSaltSync(12);
const jwtSecret = 'hkHkkbhk8a9adkawrwr563';
const fs = require('fs');
const path = require('path');
const mimeTypes = require('mime-types');
const Places = require('./models/places');
app.use('/api/uploads', express.static((__dirname + '/uploads')));
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
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
app.post('/logout', (req, res) => {
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
});

app.post('/upload-via-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    const imagePath = __dirname + '/uploads/' + newName;

    try {
        await imageDownloader.image({
            url: link,
            dest: imagePath,
            timeout: 500
        });


        res.json(newName);
    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Define storage for multer
const photosMiddleware = multer({ dest: path.join(__dirname, 'uploads/') });

app.post('/upload', photosMiddleware.array('photos', 30), async (req, res) => {
    const uploadedFiles = [];

    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;

        // Rename the file with the correct extension
        fs.renameSync(path, newPath);

        uploadedFiles.push(newPath.replace(__dirname + '\\uploads\\', ''));
    }

    res.json(uploadedFiles);

});

app.post('/places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const { token } = req.cookies;
    const {
        title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Places.create({
            owner: userData.id,
            title, address, photos: addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests, price
        });
        res.json(placeDoc);
    });
});

app.get('/user-places', (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const { id } = userData;
        res.json(await Places.find({ owner: id }));
    });
});
app.get('/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    res.json(await Places.find());
});
app.get('/places/:id', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const { id } = req.params;
    res.json(await Places.findById(id));
});

app.put('/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL);
    const { token } = req.cookies;
    const {
        id, title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Places.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title, address, photos: addedPhotos, description,
                perks, extraInfo, checkIn, checkOut, maxGuests, price
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});