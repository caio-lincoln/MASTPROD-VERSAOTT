const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, '../public/backgrounds');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Pexels ID 585419: Blueprint/Engineering (Abstract/Darkened)
// Alternative: 3760529 (Engineering plans)
const url = "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=800";
const dest = path.join(dir, 'stats-bg.jpg');

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Download completed: ' + dest);
        });
    } else {
        console.error(`Download failed. Status Code: ${response.statusCode}`);
        response.resume(); // Consume response data to free up memory
    }
}).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Error downloading image:', err.message);
});
