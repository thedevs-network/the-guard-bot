/* eslint-disable no-console */

export const throwError = (e: string | Error) => {
	if (typeof e === "string") throw new Error(e);
	else throw e;
};

export const panic = (e: Error, ...msgs: string[]) => (
	console.error(...msgs), throwError(e)
);
