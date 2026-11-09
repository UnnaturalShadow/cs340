import fs = require('fs');

interface Array2D {
    get(row: number, col: number): any;
    set(row: number, col: number, value: any): void;
    rows(): number;
    cols(): number;
}

class Array2DImpl implements Array2D {
    private data: any[][];
    private numRows: number;
    private numCols: number;
    private fileName: string;

    constructor(rows?: number, cols?: number, fileName?: string) {
        this.numRows = rows? rows : 0;
        this.numCols = cols? cols : 0;
        this.fileName = fileName? fileName : '';
        this.data = Array.from({ length: this.numRows }, () => Array(this.numCols).fill(null));
    }

    get(row: number, col: number): any {
        if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) {
            throw new Error("Index out of bounds");
        }
        return this.data[row]![col];
    }

    set(row: number, col: number, value: any): void {
        if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) {
            throw new Error("Index out of bounds");
        }
        this.data[row]![col] = value;
    }

    rows(): number {
        return this.numRows;
    }

    cols(): number {
        return this.numCols;
    }

    save(fileName: string): void {
        const dataToSave = JSON.stringify(this.data);
        fs.writeFileSync(fileName, dataToSave);
    }

    load(fileName: string): void {
        const dataLoaded = fs.readFileSync(fileName, 'utf-8');
        this.data = JSON.parse(dataLoaded);
        this.numRows = this.data.length;
        this.numCols = this.data[0]?.length ?? 0;
    }
}

class ProxyArray2D implements Array2D {
    private array2D: Array2DImpl;
    private fileName: string;
    private isLoaded: boolean = false;

    constructor(fileName: string) {
        this.array2D = new Array2DImpl(); 
        this.fileName = fileName;
    }

    get(row: number, col: number): any {
        if (!this.isLoaded) {
            this.array2D.load(this.fileName);
            this.isLoaded = true;
        }
        return this.array2D.get(row, col);
    }

    set(row: number, col: number, value: any): void {
        if (!this.isLoaded) {
            this.array2D.load(this.fileName);
            this.isLoaded = true;
        }
        this.array2D.set(row, col, value);
    }

    rows(): number {
        if (!this.isLoaded) {
            this.array2D.load(this.fileName);
            this.isLoaded = true;
        }
        return this.array2D.rows();
    }

    cols(): number {
        if (!this.isLoaded) {
            this.array2D.load(this.fileName);
            this.isLoaded = true;
        }
        return this.array2D.cols();
    }
}

export = { Array2DImpl, ProxyArray2D };