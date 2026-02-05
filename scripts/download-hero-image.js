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
        response.resume();
    }
  }).on('error', (err) => {
    fs.unlink(dest);
    console.error(`Error downloading ${dest}: ${err.message}`);
  });
};

// Pexels ID: 8293680 (Checklist/Safety Vest)
// Using w=800 for optimization (card is max-w-md ~450px)
const url = "https://images.pexels.com/photos/8293680/pexels-photo-8293680.jpeg?auto=compress&cs=tinysrgb&w=800";
const dest = "public/images/hero-safety-compliance.jpg";

// Ensure directory exists
const dir = "public/images";
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

download(url, dest);
