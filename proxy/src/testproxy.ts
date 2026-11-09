import Array2D = require('./Array2D');
import fs = require('fs');
import os = require('os');
import path = require('path');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'proxy-demo-'));
const fileName = path.join(directory, 'array.json');

try {
    // The file does not exist yet so construction would fail if it loaded eagerly.
    const array = new Array2D.ProxyArray2D(fileName);
    console.log('Proxy created successfully before its file exists.');

    fs.writeFileSync(fileName, JSON.stringify([[1, 2], [3, 4]]));
    console.log('First get loads the file:', array.get(0, 0), '(expected 1)');

    // Later operations must use the loaded array because the file is now gone.
    fs.unlinkSync(fileName);
    console.log('Read after deleting file:', array.get(1, 1), '(expected 4)');
    console.log('Dimensions:', array.rows(), 'x', array.cols(), '(expected 2 x 2)');
    array.set(0, 0, 99);
    console.log('Value after set:', array.get(0, 0), '(expected 99)');
} finally {
    fs.rmSync(directory, { recursive: true, force: true });
}
