import ModelX from '../src/model'

const { update, listen, proxy } = ModelX

describe('ModelX', () => {

	it('should have function proxy()', () => {
		expect(typeof ModelX.proxy === 'function').toBe(true)
	})
	it('should have function listen()', () => {
		expect(typeof ModelX.listen === 'function').toBe(true)
	})
	it('should have function observe()', () => {
		expect(typeof ModelX.observe === 'function').toBe(true)
	})
	it('should have function trigger()', () => {
		expect(typeof ModelX.trigger === 'function').toBe(true)
	})
	it('should have function update()', () => {
		expect(typeof ModelX.update === 'function').toBe(true)
	})
	it('should trigger add / remove events', () => {
		const state = proxy({})
		state.foo = 'bar'
		expect(state.foo).toBe('bar')
		delete state.foo
		expect(state.foo).toBe(void 0)
	})
	it('should trigger update events with 2 arguments', async () => {
		const state = proxy({})
		const onUpdate = jest.fn()
		listen(state, 'update', onUpdate)
		await update(state, { foo: 'bar' })
		expect(onUpdate.mock.calls.length).toBe(1)
		expect(onUpdate.mock.calls[0].length).toBe(2)
		expect(onUpdate.mock.calls[0][0] instanceof Object).toBe(true)
	})
	it('should trigger events in the right order', async () => {
		const state = proxy({})
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