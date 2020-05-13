export function pMap<T, U>(arr: T[], fn: (t: T) => Promise<U>) {
	return Promise.all(arr.map(fn));
}
