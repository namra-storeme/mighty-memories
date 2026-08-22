import "dotenv/config";
import { getDb } from "./src/lib/firebase";

async function main() {
  const db = getDb();
  const snap = await db.ref("portfolioImages").limitToLast(1).once("value");
  console.log(snap.val());
}
main();
