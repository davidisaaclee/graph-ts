import * as Graph from '../src/graph';
import * as graphs from './fixtures/graphs';

test('library imports members', () => {
	expect(Object.keys(Graph)).not.toHaveLength(0);
});

test('finds edges with specified destination', () => {
	const edgesToC = Graph.edgesWithDestination('c', graphs.graph1);
	expect(edgesToC)
		.toEqual({
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
		});
});

test('finds edges with specified source', () => {
	const edgesFromA = Graph.edgesWithSource('a', graphs.graph1);
	expect(edgesFromA)
		.toEqual({
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
		});
});
