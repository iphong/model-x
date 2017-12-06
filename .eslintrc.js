const path = require('path')
module.exports = {
	parser: 'babel-eslint',
	env: {
		es6: true,
		node: true,
		jest: true
	},
	globals: {
		Promise: 1
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2017
	},
	extends: ['plugin:flowtype/recommended'],
	plugins: ['flowtype'],
	rules: {
		'semi': 0,
		'strict': 1,
		'indent': 0,
		'no-undef': 1,
		'no-fallthrough': 1,
		'no-tabs': 0,
		'camelcase': 0,
		'comma-dangle': 1,
		'consistent-return': 0,
		'eqeqeq': 1,
		'no-underscore-dangle': 0,
		'no-shadow': 1,
		'no-plusplus': 0,
		'no-undef': 1,
		'no-unreachable': 1,
		'max-len': 0,
		'no-console': 0,
		'padded-blocks': 0,
		'no-trailing-spaces': 1,
		'space-in-parens': 1,
		'arrow-parens': 0,
		'no-param-reassign': 0,
		'no-unused-vars': 0,
		'no-unused-prop-types': 0,
		'no-unused-expressions': 0,
		'object-curly-spacing': 0,
		'global-require': 1,
		'class-methods-use-this': 0,
		'one-var': 0,
		'brace-style': 1,
		'one-var-declaration-per-line': 1,
		'prefer-template': 1,
		'prefer-const': 1,
		'prefer-rest-params': 1,
		'no-nested-ternary': 0,
		'react/jsx-wrap-multilines': 0,
		'no-useless-constructor': 1,
		'no-useless-escape': 1,
		'no-eval': 1,
		'vars-on-top': 1,
		'no-var': 1,
		'no-irregular-whitespace': 1,
		'no-multi-assign': 0, // <-- why not? eg. this.foo = this.bar = 'value'
		'no-empty': 1,
		'default-case': 0, // <-- It is ok not to have default case
		'no-case-declarations': 0,
		'guard-for-in': 0,
		'no-restricted-syntax': 1,
		'no-throw-literal': 1,
		'no-constant-condition': 1
	}
}
