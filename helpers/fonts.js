const path = require('path');
const { GlobalFonts } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath(
  path.join(__dirname, '../assets/fonts/Pauls_Ransom_Note.ttf'),
  'Pauls Ransom Note'
);
GlobalFonts.registerFromPath(
  path.join(__dirname, '../assets/fonts/GreatVibes-Regular.ttf'),
  'Great Vibes'
);
