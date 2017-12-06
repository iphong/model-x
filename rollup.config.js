import babel from 'rollup-plugin-babel'

export default {
	input: './src/index.js',
	output: {
		name: 'ModelX',
		format: 'cjs',
		file: './dist/index.js'
	},
	plugins: [babel()]
}
