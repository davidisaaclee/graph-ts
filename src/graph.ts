import { setDifference } from './setDifference';
import { omit, pickBy } from 'lodash';

export type Edge<EdgeMetadata> = { src: string, dst: string, metadata: EdgeMetadata };
export interface Graph<Node, EdgeMetadata> {
	_nodes: { [key: string]: Node };
	_edges: { [key: string]: Edge<EdgeMetadata> };
}

export const empty = Object.freeze({ _nodes: {}, _edges: {} });

export function edgesWithSource<Node, EdgeMetadata>(
	srcKey: string,
	graph: Graph<Node, EdgeMetadata>
): { [edgeKey: string]: Edge<EdgeMetadata> } {
	const result: { [edgeKey: string]: Edge<EdgeMetadata> } = {};

	for (const edgeKey of Object.keys(graph._edges)) {
		if (graph._edges[edgeKey].src === srcKey) {
			result[edgeKey] = graph._edges[edgeKey];
		}
	}

	return result;
}

export function edgesWithDestination<Node, EdgeMetadata>(
	dstKey: string,
	graph: Graph<Node, EdgeMetadata>
): { [edgeKey: string]: Edge<EdgeMetadata> }  {
	const result: { [edgeKey: string]: Edge<EdgeMetadata> } = {};

	for (const edgeKey of Object.keys(graph._edges)) {
		if (graph._edges[edgeKey].dst === dstKey) {
			result[edgeKey] = graph._edges[edgeKey];
		}
	}

	return result;
}

export type ExecutionStep = {
	nodeKey: string,
	edges: Array<{ edgeKey: string, beginsCycle: boolean }>
};

export function resolveDependencies<Node>(
	graph: Graph<Node, any>,
	startNode: string
): Array<ExecutionStep> {
	const resolved = new Set();
	const seen = new Set();

	let steps: Array<ExecutionStep> = [];
	function helper(nodeKey: string, seen: Set<string>) {
		const newSeen = new Set(seen);
		newSeen.add(nodeKey);

		let edges = [];
		const edgesFromCurrentNode =
			edgesWithSource(nodeKey, graph);
		for (const edgeKey of Object.keys(edgesFromCurrentNode)) {
			const dst = edgesFromCurrentNode[edgeKey].dst;
			const beginsCycle = newSeen.has(dst);

			if (!resolved.has(dst)) {
				if (!beginsCycle) {
					helper(dst, newSeen);
				}
			}

			edges.push({ edgeKey, beginsCycle });
		}

		steps.push({ nodeKey, edges });
		resolved.add(nodeKey);
	}

	helper(startNode, new Set());

	return steps;
}

export function mapNodes<TransformedNode, OriginalNode, EdgeMetadata>(
	graph: Graph<OriginalNode, EdgeMetadata>,
	transform: (original: OriginalNode) => TransformedNode,
): Graph<TransformedNode, EdgeMetadata> {
	return {
		_nodes: Object.keys(graph._nodes)
			.reduce((acc, key) => {
				acc[key] = transform(graph._nodes[key]);
				return acc;
			}, {} as { [key: string]: TransformedNode }),
		_edges: graph._edges
	};
}

export function mapEdges<TransformedEdgeWeight, OriginalEdgeWeight, Node>(
	graph: Graph<Node, OriginalEdgeWeight>,
	transform: (original: OriginalEdgeWeight, src: string, dst: string) => TransformedEdgeWeight,
): Graph<Node, TransformedEdgeWeight> {
	return {
		_nodes: graph._nodes,
		_edges: Object.keys(graph._edges)
			.reduce((acc, key) => {
				acc[key] = {
					...graph._edges[key],
					metadata: transform(graph._edges[key].metadata, graph._edges[key].src, graph._edges[key].dst)
				};
				return acc;
			}, {} as { [key: string]: { src: string, dst: string, metadata: TransformedEdgeWeight } }),
	};
}

export function findEdge<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	predicate: (metadata: Edge<EdgeMetadata>) => boolean
): string | null {
	const retval = Object.keys(graph._edges)
		.find(key => predicate(graph._edges[key]));

	if (retval == null) {
		return null;
	} else {
		return retval;
	}
}

export function insertEdge<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	edge: Edge<EdgeMetadata>,
	key: string
): Graph<Node, EdgeMetadata> {
	return {
		...graph,
		_edges: {
			...graph._edges,
			[key]: edge
		}
	};
}

export function removeEdge<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	keyToRemove: string
): Graph<Node, EdgeMetadata> {
	return {
		...graph,
		_edges: omit(graph._edges, keyToRemove)
	};
}

export function filterEdges<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	predicate: (metadata: Edge<EdgeMetadata>) => boolean
): { [edgeKey: string]: Edge<EdgeMetadata> } {
	return pickBy(graph._edges, edge => predicate(edge)) as Record<string, Edge<EdgeMetadata>>;
}

export function edgeForKey<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	key: string
): Edge<EdgeMetadata> | null {
	return graph._edges[key];
}

export function allEdges<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>
): Record<string, Edge<EdgeMetadata>> {
	return graph._edges;
}


export function insertNode<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	node: Node,
	key: string
): Graph<Node, EdgeMetadata> {
	return {
		...graph,
		_nodes: {
			...graph._nodes,
			[key]: node
		}
	};
}

export function nodeForKey<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	key: string
): Node | null {
	return graph._nodes[key];
}

export function allNodes<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>
): Record<string, Node> {
	return graph._nodes;
}

export function mutateNode<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	nodeKey: string,
	transform: (original: Node) => Node
): Graph<Node, EdgeMetadata> {
	if (graph._nodes[nodeKey] == null) {
		return graph;
	}

	return {
		...graph,
		_nodes: {
			...graph._nodes,
			[nodeKey]: transform(graph._nodes[nodeKey])
		}
	};
}

export function merge<N, E>(
	g1: Graph<N, E>,
	g2: Graph<N, E>
): Graph<N, E> {
	return {
		_nodes: {
			...g1._nodes,
			...g2._nodes,
		},
		_edges: {
			...g1._edges,
			...g2._edges,
		}
	};
}
