// checkDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    
    console.log('🔗 Connexion établie:');
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Port:', mongoose.connection.port);
    console.log('   - Database:', mongoose.connection.name);
    console.log('   - Collections:', Object.keys(mongoose.connection.collections));
    
    // Lister toutes les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Collections dans la base:');
    collections.forEach(collection => {
      console.log('   -', collection.name);
    });
    
    // Compter les users
    const userCount = await mongoose.connection.collection('users').countDocuments();
    console.log('\n👥 Nombre d\'utilisateurs dans "users":', userCount);
    
    // Voir les users
    if (userCount > 0) {
      const users = await mongoose.connection.collection('users').find({}).toArray();
      console.log('\n📝 Utilisateurs:');
      users.forEach(user => {
        console.log('   -', user.email, `(${user._id})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();