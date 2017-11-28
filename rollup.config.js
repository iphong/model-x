import babel from 'rollup-plugin-babel'

export default {
	input: './src/model.js',
	output: {
		name: 'ModelX',
		format: 'umd',
		file: './dist/model.js'
	},
	plugins: [babel()]
}
