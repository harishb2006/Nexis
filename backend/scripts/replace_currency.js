import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const files = [
    '/home/harish/Videos/Nexis_present/Nexis/backend/ai/data/Payment.txt',
    '/home/harish/Videos/Nexis_present/Nexis/backend/ai/data/Returns.txt',
    '/home/harish/Videos/Nexis_present/Nexis/backend/ai/data/Eligibility.txt',
    '/home/harish/Videos/Nexis_present/Nexis/backend/ai/data/Shipping.txt'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/\$/g, '₹');
        content = content.replace(/\bUSD\b/g, 'INR');
        content = content.replace(/\bdollar\b/ig, 'rupee');
        content = content.replace(/\bdollars\b/ig, 'rupees');
        content = content.replace(/₹7\.99/g, '₹650'); // standard shipping fee
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
console.log('Currency replaced in AI data files.');
