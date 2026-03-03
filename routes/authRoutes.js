const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//Anslut till MongoDB
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Ansluten till MongoDB");
}).catch((error) => {
    console.error("Error vid anslutning till MongoDB:" + error)
});

//Användar-model
const User = require("../models/user");

//Lägg till ny användare
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //Validera input
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Ogiltig inmatning, fyll i användarnamn, epost och lösenord" });
        }

        if (username.length < 4) {
            return res.status(400).json({ error: "Användarnamn måste bestå av minst fyra tecken" });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Ogiltig e-postadress" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Lösenord måste bestå av minst sex tecken" });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: "Användaren är redan registrerad" });
        }

        //Korrekt input - Skapa användare
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: "Användare skapad" });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

//Logga in användare
router.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        //Validera input
        if (!login || !password) {
            return res.status(400).json({ error: "Ogiltig inmatning, fyll i användarnamn och lösenord" });
        }

        //Kontrollera username och password
        //Kontrollera om användaren finns
        const user = await User.findOne({ $or: [{ username: login }, { email: login }] });
        if (!user) {
            return res.status(401).json({ error: "Fel användarnamn/e-post eller lösenord" });
        }
        //Kontrollera lösenord
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Fel användarnamn/e-post eller lösenord" });
        } else {
            const payload = { id: user._id, username: user.username, email: user.email };
            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "3h" });

            res.status(200).json({
                message: "Inloggningen lyckades",
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                },
                token: token
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

//Validera token
router.get("/validate", (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "Inget token hittades" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Ogiltigt token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        res.json({ user: { username: decoded.username } });

    } catch (error) {
        return res.status(401).json({ error: "Ogiltigt token" });
    }
});

module.exports = router;