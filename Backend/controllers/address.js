const Address = require("../Model/Address");

// Ajouter une adresse
exports.addAddress = async (req, res) => {
    try {
        const { street, city, postalCode, country, type } = req.body;

        // ✔️ Le bon userId
        const userId = req.user.userId;

        const newAddress = new Address({
            userId,
            street,
            city,
            postalCode,
            country,
            type
        });

        await newAddress.save();

        res.status(201).json({
            message: "Adresse ajoutée avec succès",
            address: newAddress
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};


// Récupérer toutes les adresses d'un utilisateur
exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.userId; // même clé que addAddress

        const addresses = await Address.find({ userId: userId });

        res.json(addresses);
    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};


// Supprimer une adresse
exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const address = await Address.findOneAndDelete({
            _id: id,
            userId: userId
        });

        if (!address) {
            return res.status(404).json({
                message: "Adresse introuvable ou non autorisée"
            });
        }

        res.json({ message: "Adresse supprimée" });

    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};


// Modifier une addresse
exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { street, city, postalCode, country, type } = req.body;

        const userId = req.user.userId; // user du JWT

        // On vérifie que l'adresse appartient au user connecté
        const address = await Address.findOneAndUpdate(
            { _id: id, userId: userId },
            {
                street,
                city,
                postalCode,
                country,
                type
            },
            { new: true } // retourne l'adresse mise à jour
        );

        if (!address) {
            return res.status(404).json({
                message: "Adresse introuvable ou non autorisée"
            });
        }

        res.json({
            message: "Adresse mise à jour avec succès",
            address
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};



