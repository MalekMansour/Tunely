const admin = require('firebase-admin');


// Load service account from JSON file
const serviceAccount = require('/etc/secrets/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log('Firebase Admin initialized successfully');

module.exports = admin;