import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, query, limitToLast } from 'firebase/database';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const projectId = env.match(/FIREBASE_PROJECT_ID="(.*?)"/)?.[1];
const apiKey = env.match(/FIREBASE_API_KEY="(.*?)"/)?.[1];
const authDomain = `${projectId}.firebaseapp.com`;
const databaseURL = "https://m2-mighty-memories-default-rtdb.asia-southeast1.firebasedatabase.app";

const app = initializeApp({
  projectId,
  apiKey,
  authDomain,
  databaseURL
});

const db = getDatabase(app);
const portfolioRef = query(ref(db, 'portfolioImages'), limitToLast(1));

get(portfolioRef).then((snapshot) => {
  console.log(snapshot.val());
  process.exit(0);
}).catch(console.error);
