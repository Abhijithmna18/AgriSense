const fs = require('fs');
const targetFile = 'd:\\New folder\\intern\\Agri\\farmer_ai-frontend\\src\\pages\\SmartIrrigationDashboard.jsx';
const newJSX = fs.readFileSync('tmp_jsx.txt', 'utf8');

fs.writeFileSync(targetFile, newJSX, 'utf8');
console.log('Successfully completely overhauled JSX body.');
