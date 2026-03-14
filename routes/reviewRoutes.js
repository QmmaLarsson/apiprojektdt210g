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
    console.error("Error vid anslutning till MongoDB: " + error)
});

//Review-model
const Review = require("../models/review");

//Hämta recensioner
router.get("/review", async (req, res) => {
    try {
        const { bookId } = req.query;

        //Om bookId skickas, filtrera recensionerna
        const query = bookId ? { bookId } : {};

        //Hämta recensioner och lägg till användarnamn
        const reviews = await Review.find(query).populate("user", "username");

        // Skicka data tillbaka till klienten
        res.json(reviews);
    } catch (error) {
        // Hantera eventuella fel
        console.error("Det uppstod ett fel vid hämtning av data:", error);
        res.status(500).json({ message: "Det uppstod ett fel vid hämtning av data." });
    }
});

//Hämta recensioner för en enskild person
router.get("/review/my", authenticateToken, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id }).populate("user", "username");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Det uppstod ett fel vid hämtning av data" });
    }
});

//Hämta enskild recension
router.get("/review/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Review.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Recensionen hittades inte" });
        }

        res.json(post);
    } catch (error) {
        console.error("Fel vid hämtning av recensionen:", error);
        res.status(500).json({ message: "Det uppstod ett fel vid hämtning av recensionen" });
    }
});

//Posta ny recension
router.post("/review", authenticateToken, async (req, res) => {
    try {
        const { bookId, bookTitle, bookThumbnail, reviewText, rating } = req.body;

        //Validera input
        if (!bookId || !reviewText || !rating) {
            return res.status(400).json({ error: "Ogiltig inmatning, vänligen fyll i alla fält" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating måste vara mellan 1 och 5" });
        }

        const existingReview = await Review.findOne({ bookId, user: req.user.id });
        if (existingReview) {
            return res.status(400).json({ error: "Du har redan recenserat denna bok" });
        }

        //Korrekt input - Skapa ny recension
        const newItem = new Review({ bookId, bookTitle, bookThumbnail: bookThumbnail || "", reviewText, rating, user: req.user.id });
        await newItem.save();
        res.status(201).json({ message: "Ny recension skapad" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

//Ta bort recension
router.delete("/review/:id", authenticateToken, async (req, res) => {
    try {
        const itemId = req.params.id;

        const result = await Review.findByIdAndDelete(itemId);

        return res.json(result);
    } catch (error) {
        //Errorhantering
        return res.status(500).json({ message: "Det uppstod ett fel vid borttagning av recension", error: error });
    }
});

//Uppdatera recension
router.put("/review/:id", authenticateToken, async (req, res) => {
    try {
        const itemId = req.params.id;
        const updatedItem = req.body;

        const result = await Review.findByIdAndUpdate(itemId, updatedItem, { new: true });

        return res.json(result);
    } catch (error) {
        //Errorhantering
        return res.status(500).json({ message: "Det uppstod ett fel vid uppdatering av recension.", error: error });
    }
});

//Validering av token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Token saknas" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ error: "Token är ogiltig" });
    }
}


module.exports = router;