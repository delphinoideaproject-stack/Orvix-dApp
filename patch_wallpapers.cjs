const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf8');

const wallpapers = [
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80"
];

let i = 0;
content = content.replace(/id: 'testnet-(bts|pvt|ntc|fdv|trav|oph)'(.*?)\n\s+logo: '(.*?)'/gs, function(match, id, p2, logo) {
  return match + ",\n    wallpaper: '" + wallpapers[i++ % wallpapers.length] + "'";
});

fs.writeFileSync('src/data.ts', content);
