// resetWithoutSpecialChars.js
require('dotenv').config();
const mongoose = require('mongoose');
const argon2 = require('argon2');
const User = require('./Model/userModel');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    
    const email = 'nesrinehadil87@gmail.com';
    // Mot de passe SANS caractères spéciaux
    const newPassword = 'Hadil123';
    
    console.log('🔄 RÉINITIALISATION SANS CARACTÈRES SPÉCIAUX...');
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const newHash = await argon2.hash(newPassword);
    user.password = newHash;
    await user.save();
    
    console.log('🎉 MOT DE PASSE RÉINITIALISÉ!');
    console.log('📧 Email:', email);
    console.log('🔑 NOUVEAU MOT DE PASSE:', newPassword);
    console.log('💾 Nouveau hash:', newHash.substring(0, 50) + '...');
    
    // Vérification immédiate
    const testMatch = await argon2.verify(newHash, newPassword);
    console.log('✅ Test vérification:', testMatch ? 'SUCCÈS' : 'ÉCHEC');
    
    if (testMatch) {
      console.log('\n🚀 MAINTENANT TESTEZ AVEC:');
      console.log('Email: nesrinehadil87@gmail.com');
      console.log('Mot de passe: Hadil123');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

resetPassword();