var util = require('util');

let enabled = false;

export default function log(title, obj) {
  if (enabled) {
    printTitle(title);
    console.log(util.inspect(obj, {
      depth: 4,
      colors: true
    }));
  }
}

export function setEnable(enable) {
  enabled = enable;
}

function printTitle(title) {
  console.log('\n-------------------------\n', title, '\n-------------------------');
}
