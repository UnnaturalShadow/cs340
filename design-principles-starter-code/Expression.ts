
// 1. What design principles does this code violate?
// 2. Refactor the code to improve its design.
//
// 1. The negated compound condition and redundant true/false branches obscure
//    the business rule, violating readability and simplicity. Unnamed thresholds
//    also make the policy harder to understand and maintain.
// 2. Name the thresholds and qualifying cases, then return the condition directly.
//    The original strict and inclusive boundaries are preserved.

function isLowRiskClient(score: number, income: number, authorized: boolean): boolean {
	const highScoreThreshold = 700;
	const authorizedScoreThreshold = 500;
	const middleIncomeMinimum = 40000;
	const highIncomeThreshold = 100000;

	const hasHighScore = score > highScoreThreshold;
	const hasHighIncome = income > highIncomeThreshold;
	const isAuthorizedMiddleIncomeClient =
		income >= middleIncomeMinimum && income <= highIncomeThreshold &&
		authorized && score > authorizedScoreThreshold;

	return hasHighScore || isAuthorizedMiddleIncomeClient || hasHighIncome;
}
