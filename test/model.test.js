const  { update, listen, observable } = require('../dist/index')

describe('ModelX', () => {

	it('should trigger add / remove events', () => {
		const state = observable({})
		state.foo = 'bar'
		expect(state.foo).toBe('bar')
		delete state.foo
		expect(state.foo).toBe(void 0)
	})
	it('should trigger update events with 2 arguments', async () => {
		const state = observable({})
		const onUpdate = jest.fn()
		listen(state, 'update', onUpdate)
		await update(state, { foo: 'bar' })
		expect(onUpdate.mock.calls.length).toBe(1)
		expect(onUpdate.mock.calls[0].length).toBe(1)
		expect(onUpdate.mock.calls[0][0] instanceof Object).toBe(true)
	})
	it('should trigger events in the right order', async () => {
		const state = observable({})
		const onUpdate = jest.fn()
		const onChangeFoo = jest.fn()
		listen(state, 'change:foo', onChangeFoo)
		listen(state, 'update', onUpdate)
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
		expect(onChangeFoo.mock.calls.length).toBe(5)
	})
})