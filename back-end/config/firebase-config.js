const admin = require('firebase-admin');
const path = require('path');


// Load service account from JSON file
//const serviceAccount = require('/etc/secrets/serviceAccountKey.json');
const serviceAccount = path.join(__dirname, '../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log('Firebase Admin initialized successfully');

module.exports = admin;