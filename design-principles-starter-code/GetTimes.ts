// 1. What is the biggest design principle violation in the code below.
// 2. Refactor the code to improve its design.
//
// 1. The biggest violation is Don't Repeat Yourself (DRY): all three properties
//    repeat the same required-value parsing and positivity checks. Duration and
//    departure also repeat the interval-multiple check. Fixes to those rules
//    otherwise have to be made consistently in several places.
// 2. Extract shared validation into helpers, leaving getTimes to assemble the
//    result. Reject malformed numbers as well: parseInt accepts partial strings
//    and NaN bypasses a simple <= 0 check.

type Dictionary = {
    [index: string]: string
};

type Times = {
    interval: number;
    duration: number;
    departure: number;
};

function getPositiveInteger(props: Dictionary, name: string): number {
    const text = props[name];
    if (!text) {
        throw new Error(`missing ${name}`);
    }

    const value = Number(text);
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`${name} must be a positive safe integer`);
    }
    return value;
}

function getIntervalMultiple(props: Dictionary, name: string, interval: number): number {
    const value = getPositiveInteger(props, name);
    if (value % interval !== 0) {
        throw new Error(`${name} % interval != 0`);
    }
    return value;
}

function getTimes(props: Dictionary): Times {
    const interval = getPositiveInteger(props, "interval");
    const duration = getIntervalMultiple(props, "duration", interval);
    const departure = getIntervalMultiple(props, "departure", interval);
    return { interval, duration, departure };
}
