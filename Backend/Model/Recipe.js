const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  
  // Détails de la cuisine
  category: { type: String, enum: ['Entrée', 'Plat', 'Dessert', 'Boulangerie'], required: true },
  region: { type: String, default: 'Algérie' }, // Ex: Oran, Constantine, Alger
  difficulty: { type: String, enum: ['Facile', 'Moyen', 'Difficile'], default: 'Moyen' },
  duration: {
    prep: Number, // en minutes
    cook: Number  // en minutes
  },

  // Contenu de la recette
  ingredients: [{
    item: String,
    amount: Number,
    unit: String // g, ml, càs, etc.
  }],
  steps: [{
    order: Number,
    instruction: String
  }],

  // Business & Masterclass
  isMasterclass: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  videoUrl: { type: String }, // Lien vers S3 ou Cloudinary
  thumbnailUrl: { type: String },
  
  // Méta-données
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', RecipeSchema);