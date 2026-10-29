// Prints a password hash for ADMIN_USERS.
// Usage: node tools/admin-hash.cjs <password> [email]
const { hashPassword } = require('../api/_lib/auth.js');

const [pw, email = 'marketing@artpark.in'] = process.argv.slice(2);
if (!pw || pw.length < 12) { console.error('Usage: node tools/admin-hash.cjs <password of 12+ characters> [email]'); process.exit(1); }
const hash = hashPassword(pw);
console.log(hash);
console.log(`ADMIN_USERS='${JSON.stringify([{ email, hash }])}'`);
