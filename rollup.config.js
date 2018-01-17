/*
 * Copyright (c) 2018. Developed by Phong Vu
 */

import babel from 'rollup-plugin-babel'

export default {
	input: './src/index.js',
	output: {
		name: 'ModelX',
		format: 'umd',
		file: './dist/index.js'
	},
	plugins: [babel()]
}
