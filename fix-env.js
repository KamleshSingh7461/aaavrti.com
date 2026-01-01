const fs = require('fs');
const content = `DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="super-secret-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="desdbjzzt"
CLOUDINARY_API_KEY="948946598728313"
CLOUDINARY_API_SECRET="57wohuczQGXzC4pP0BxR2fCnyJM"
`;
fs.writeFileSync('.env', content);
console.log('.env fixed');
