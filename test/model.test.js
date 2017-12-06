const { update, observable, observe, intercept } = require('../dist')

describe('ModelX', () => {

	it('should preserve original object', () => {
		const state = observable({})
		state.foo = 'bar'
		expect(state.foo).toBe('bar')
		delete state.foo
		expect(state.foo).toBe(void 0)
	})
	it('should call observer fn with 3 arguments [key, next, prev]', async () => {
		const state = observable({})
		const onUpdate = jest.fn()
		observe(state, onUpdate)
		await update(state, { foo: 'bar' })
		expect(onUpdate.mock.calls.length).toBe(1)
		expect(onUpdate.mock.calls[0].length).toBe(3)
		expect(onUpdate.mock.calls[0][0]).toBe('foo')
		expect(onUpdate.mock.calls[0][1]).toBe('bar')
		expect(onUpdate.mock.calls[0][2]).toBe(undefined)
	})
	it('should emit events one by one with correct value', async () => {
		const state = {}
		const onUpdate = jest.fn()
		const onChangeFoo = jest.fn()
		observe(state, 'foo', onChangeFoo)
		observe(state, onUpdate)
		await update(state, { foo: 'A' })
		expect(state.foo).toBe('A')
		await update(state, { foo: { a: 1 } })
		expect(state).toMatchObject({ foo: { a: 1 } })
		await update(state, { foo: true })
		expect(state.foo).toBe(true)
		await update(state, { foo: 17 })
		expect(state.foo).toBe(17)
		expect(onUpdate.mock.calls.length).toBe(4)
		await update(state, { foo: null })
		expect(state.foo).toBe(null)
		expect(onChangeFoo.mock.calls.length).toBe(5)
	})
})