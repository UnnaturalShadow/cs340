
// This program violates the principles of High-Quality Abstraction, Primitive Obsession, and Information Hiding.
// 
// 1. Explain why/how this program violates the above principles.
// 2. Explain how you would refactor the code to improve its design.
//
// 1. High-Quality Abstraction: Game mixes board representation, move selection,
//    and win detection, while exposing low-level array operations. Its winner
//    method checks rows only, so it does not fully represent tic-tac-toe rules.
//    Primitive Obsession: arbitrary strings represent players and empty cells;
//    numbers represent positions, with -1 used as a sentinel for no move.
//    Information Hiding: the public mutable board lets callers change cells or
//    array length without checking whether a move or board is valid.
// 2. Introduce Player and Cell types and a validated Position value object.
//    Encapsulate the nine cells in a Board with operations such as availableMoves,
//    place, and winner. Check all three rows, three columns, and both diagonals.
//    Keep cell storage private, copy incoming arrays, and return copies or read-only
//    views instead of mutable internal state. Reject occupied or invalid positions.
//    Let Game manage game rules and delegate move selection to a strategy that
//    uses Board operations. Return an optional Position for no available move,
//    replacing the -1 sentinel, and use named factories instead of the optional
//    constructor parameters that combine board creation with playing a move.

export class Game {

	board: string[];

	constructor(board: string[], position: number = -1, player: string = '') {
		this.board = [...board];
		
		if (position >= 0 && player !== "") {
			this.board[position] = player;
		}
	}

	move(player: string): number {
		for (let i = 0; i < 9; i++) {
			if (this.board[i] == "-") {
				let game = this.play(i, player);
				if (game.winner() == player) {
					return i;
				}
			}
		}

		for (let i = 0; i < 9; i++) {
			if (this.board[i] == "-") {
				return i;
			}
		}
		return -1;
	}

	play(position: number, player: string): Game {
		return new Game(this.board, position, player);
	}

	winner(): string {
		if (this.board[0] != "-" &&
			this.board[0] == this.board[1] &&
			this.board[1] == this.board[2]) {

			return this.board[0]
		}
		if (this.board[3] != "-" &&
			this.board[3] == this.board[4] &&
			this.board[4] == this.board[5]) {

			return this.board[3]
		}
		if (this.board[6] != "-" &&
			this.board[6] == this.board[7] &&
			this.board[7] == this.board[8]) {
			return this.board[6]
		}

		return "-";
	}
}

export class GameTest {

	testDefaultMove() {
		let game = new Game(this.stringToCharArray("XOXOX-OXO"));
		this.assertEquals(5, game.move('X'));

		game = new Game(this.stringToCharArray("XOXOXOOX-"));
		this.assertEquals(8, game.move('O'));

		game = new Game(this.stringToCharArray("---------"));
		this.assertEquals(0, game.move('X'));

		game = new Game(this.stringToCharArray("XXXXXXXXX"));
		this.assertEquals(-1, game.move('X'));
	}

	testFindWinningMove() {
		let game = new Game(this.stringToCharArray("XO-XX-OOX"));
		this.assertEquals(5, game.move('X'));
	}
	
	testWinConditions() {
		let game = new Game(this.stringToCharArray("---XXX---"));
		this.assertEquals('X', game.winner());
	}

	private assertEquals(expected: string | number, actual: string | number){
		if (expected !== actual) {
			console.error(`${expected} != ${actual}`);
		}
	}

	private stringToCharArray(str: string): string[] {
		let result: string[] = [];
		for (const char of str) {
			result.push(char);
		}
		return result;
	}
}

// Test Driver

let gameTest = new GameTest();
gameTest.testDefaultMove();
gameTest.testFindWinningMove();
gameTest.testWinConditions();
