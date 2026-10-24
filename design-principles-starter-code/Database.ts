
// 1. What design principle(s) does this code violate?
// 2. Explain how you would refactor this code to improve its design.
//
// 1. Course violates the Single Responsibility Principle by combining course
//    domain data with database persistence. It also couples the domain abstraction
//    to storage details, weakening separation of concerns and information hiding.
// 2. Keep Course focused on course data and domain rules. Move create, find, and
//    update into a CourseRepository interface with a database implementation.
//    Inject that repository into services that need persistence. SQL, connections,
//    and record mapping then stay inside the implementation; domain code can be
//    tested with an in-memory repository without depending on a database.

export class Course {

	name: string;
	credits: number;

	constructor(name: string, credits: number) {
		this.name = name;
		this.credits = credits;
	}

	static async create(name: string, credits: number): Promise<Course> {

		// ... Code to insert a new Course object into the database ...

	}

	static async find(name: string): Promise<Course | undefined> {

		// ... Code to find a Course object in the database ...

	}

	async update(): Promise<void> {

		// ... Code to update a Course object in the database ...

	}

}
