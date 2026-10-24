
// 1. Explain how this program violates the High-Quality Abstraction principle.
// 2. Explain how you would refactor the code to improve its design.
//
// 1. Employee is an incomplete abstraction: it exposes employment dates but
//    leaves employment-related behavior in RetirementCalculator. Calculating
//    service length and time in a position requires knowledge of employment
//    history, so the calculator is doing work that belongs to that abstraction.
//    Public mutable dates also let callers bypass rules about valid date ranges.
// 2. Encapsulate employment history in Employee (or an EmploymentHistory value
//    object) and expose totalYearsOfService(asOf) and monthsInLastPosition(asOf).
//    Store position history explicitly; employment start/end dates alone cannot
//    describe changes of position. Validate date ranges and defensively copy Date
//    values. RetirementCalculator should ask for those domain facts and apply
//    retirement policy, keeping benefit calculations separate from employment
//    history. The exact service and benefit rules must come from the requirements.

class Employee {
	public employmentStartDate: Date;
	public employmentEndDate: Date;
}

class RetirementCalculator {
	private employee: Employee;

	public constructor(emp: Employee) {
		this.employee = emp;
	}

	public calculateRetirement(payPeriodStart: Date, payPeriodEnd: Date): number { … }

	private getTotalYearsOfService(startDate: Date, endDate: Date): number { … }

	private getMonthsInLastPosition(startDate: Date, endDate: Date): number { … }
	
    ...
}
