import babel from 'rollup-plugin-babel'

export default {
	input: './index.js',
	output: {
		name: 'ModelX',
		format: 'umd',
		file: './dist/index.js'
	},
	plugins: [
		babel({
			plugins: ['external-helpers']
		})
	]
}
