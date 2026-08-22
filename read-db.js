const admin = require('firebase-admin');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const projectId = env.split('FIREBASE_PROJECT_ID="')[1].split('"')[0];
const clientEmail = env.split('FIREBASE_CLIENT_EMAIL="')[1].split('"')[0];
const privateKey = env.split('FIREBASE_PRIVATE_KEY="')[1].split('"')[0].replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey
  }),
  databaseURL: 'https://m2-mighty-memories-default-rtdb.asia-southeast1.firebasedatabase.app'
});

admin.database().ref('portfolioImages').limitToLast(1).once('value')
  .then(s => {
    console.log(s.val());
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
