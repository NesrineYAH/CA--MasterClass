//Backend/delivery.js 
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/relays", async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude et longitude requises" });
    }

    const europeBox = "(34.5,-31.5,71.2,39.6)";

    const query = `
        [out:json];
        (
            node["amenity"="post_office"]${europeBox};
            node["amenity"="parcel_locker"]${europeBox};
            node["amenity"="pickup_point"]${europeBox};
        );
        out center;
    `;

    try {
        const response = await axios.post(
            "https://overpass-api.de/api/interpreter",
            query,
            { headers: { "Content-Type": "text/plain" } }
        );

        const relays = response.data.elements.map((el) => ({
            id: el.id,
            name: el.tags.name || "Point de retrait",
            address: el.tags["addr:street"] || "",
            city: el.tags["addr:city"] || "",
            zip: el.tags["addr:postcode"] || "",
            country: el.tags["addr:country"] || "",
            lat: el.lat,
            lng: el.lon,
        }));

        res.json({ relays });
    } catch (err) {
        console.error("Erreur Overpass:", err.message);
        res.json({ relays: [] });
    }
});

module.exports = router;
