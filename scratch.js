const admin = require('firebase-admin');

const projectId = "m2-mighty-memories";
const clientEmail = "firebase-adminsdk-m6xhe@m2-mighty-memories.iam.gserviceaccount.com";
// I will get the key from the .env file

const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/FIREBASE_PRIVATE_KEY="(.*?)"/);
if (!keyMatch) {
  console.log("No key found");
  process.exit(1);
}

const privateKey = keyMatch[1].replace(/\\n/g, '\n');

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
    console.log(JSON.stringify(s.val(), null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
