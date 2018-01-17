/*
 * Copyright (c) 2018. Developed by Phong Vu
 */

// @flow
import * as React from 'react'

interface Element {
	inspector(): React.Node
}

interface Block {
	inspector(): React.Node
}


function foo(a: number, b: number): number {
	return a + b
}