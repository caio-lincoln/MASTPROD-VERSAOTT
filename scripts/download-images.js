const fs = require('fs');
const https = require('https');

const download = (url, dest) => {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${dest}`);
        });
    } else {
        console.error(`Failed to download ${dest}: Status Code ${response.statusCode}`);
        response.resume(); // Consume response data to free up memory
    }
  }).on('error', (err) => {
    fs.unlink(dest);
    console.error(`Error downloading ${dest}: ${err.message}`);
  });
};

// IDs from Pexels (Confirmed via Search)
// CTA: Sunset Construction (ID 13319079)
// Diferenciais: General Construction (ID 1216589) - Will look good with blue overlay
download("https://images.pexels.com/photos/13319079/pexels-photo-13319079.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1", "public/backgrounds/cta-bg.jpg");
download("https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1", "public/backgrounds/diferenciais-bg.jpg");
