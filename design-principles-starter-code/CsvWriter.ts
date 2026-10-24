
// 1. Explain why/how this program violates the Single Responsibility Principle
// 2. Explain how you would refactor the program to improve its design.
//
// 1. CsvWriter has two responsibilities: formatting fields and records as CSV,
//    and sending the result to the console. CSV escaping rules and the output
//    destination can change independently, giving this class two reasons to change.
// 2. Extract a CsvFormatter with pure formatField and formatRow methods that
//    return strings. Keep CsvWriter responsible for sending complete rows to an
//    injected output destination. This also allows formatting to be tested without
//    capturing console output. Write each row once: console.log adds a newline,
//    so logging individual commas and characters does not produce valid CSV rows.
//    The formatter should quote fields containing commas, quotes, CR, or LF and
//    escape embedded quotes by doubling them.

export class CsvWriter {

	public write(lines: string[][] ) {
		for (let i = 0; i < lines.length; i++)
			this.writeLine(lines[i]);
	}

	private writeLine(fields: string[]) {
		if (fields.length == 0)
			console.log();
		else {
			this.writeField(fields[0]);

			for (let i = 1; i < fields.length; i++) {
				console.log(",");
				this.writeField(fields[i]);
			}
			console.log();
		}
	}

	private writeField(field: string) {
		if (field.indexOf(',') != -1 || field.indexOf('\"') != -1)
			this.writeQuoted(field);
		else
			console.log(field);
	}

	private writeQuoted(field: string) {
		console.log('\"');
		for (let i = 0; i < field.length; i++) {
			let c: string = field.charAt(i);
			if (c == '\"')
				console.log("\"\"");
			else
				console.log(c);
		}
		console.log('\"');
	}
}
