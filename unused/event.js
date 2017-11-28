const symbol = Symbol('observers')

export function observers(obj): Set {
	return (obj[symbol] = obj[symbol] || new Set())
}
export function observe(obj, observer): Function {
	return observers(obj).add(observer).delete.bind(obj, observer)
}
export async function dispatch(obj, ...args): Promise {
	for (const observer of observers(obj))
		typeof observer === 'function' && (await observer(...args))
}
