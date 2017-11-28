// @flow
export function is(obj: {}, prop: any, value: any): boolean {
	return obj[prop] === value
}

export function set(
	obj: {},
	prop: any,
	value: any,
	descriptor: ?{ enumerable: ?boolean }
) {
	if (descriptor) Object.defineProperty(obj, prop, { ...descriptor, value })
	else obj[prop] = value
}

export function get(obj: ?{}, prop: any): any {
	return obj && typeof obj === 'object' ? obj[prop] : void 0
}

export function has(obj: ?{}, prop: any): boolean {
	return obj && typeof obj === 'object' && obj.hasOwnProperty(prop)
}

export async function delay(time) {
	return new Promise(resolve => {
		setTimeout(resolve, time)
	})
}
