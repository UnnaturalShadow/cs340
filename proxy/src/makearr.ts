import Array2D = require('./Array2D');

const array = new Array2D.Array2DImpl(3, 4);

for (let row = 0; row < array.rows(); row++) {
    for (let col = 0; col < array.cols(); col++) {
        array.set(row, col, row * array.cols() + col + 1);
    }
}

const fileName = process.argv[2] ?? 'array2d.json';
array.save(fileName);
console.log(`Saved ${array.rows()} x ${array.cols()} array to ${fileName}`);
