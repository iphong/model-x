import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
	input: './index.js',
	output: {
		file: './dist/index.js',
		format: 'cjs',
		name: 'model'
	},
	plugins: [
		resolve(),
		babel({
			plugins: ['external-helpers'],
			// exclude: 'node_modules/**'
		})
	]
}
