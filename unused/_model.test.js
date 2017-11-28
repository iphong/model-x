import Model, { isBusy2 } from './_model'

describe('Model', () => {
	const model = new Model()
	it('should be empty when created', () => {
		expect(model.get('a') === undefined).toBe(true)
	})
	it('should set value value', async () => {
		await model.set('a', 'c')
		expect(model.get('a') === 'c').toBe(true)
	})
	it('should trigger events in order', async () => {
		await model.set('foo', { a: 1 })
		expect(model.get('foo') instanceof Model).toBe(true)
		await model.set('bar', 'Hello World')
		expect(model.get('bar') === 'Hello World').toBe(true)
		await model.set({ foo: 2, bar: 'Something Else' })
		expect(model.get('foo') === 2).toBe(true)
		expect(model.get('bar') === 'Something Else').toBe(true)
		return
	})
})
