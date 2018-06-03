import { Graph } from '../../src/graph';

export const graph1: Graph<number, null> = {
	nodes: {
		'a': 0,
		'b': 1,
		'c': 2,
	},
	edges: {
		'ab': {
			src: 'a',
			dst: 'b',
			metadata: null
		},
		'ac': {
			src: 'a',
			dst: 'c',
			metadata: null
		},
		'bc': {
			src: 'b',
			dst: 'c',
			metadata: null
		},
		'cc': {
			src: 'c',
			dst: 'c',
			metadata: null
		},
		'cc2': {
			src: 'c',
			dst: 'c',
			metadata: null
		},
	}
};
