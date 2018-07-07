import { omit, pickBy, mapKeys, mapValues } from 'lodash';
import { setDifference } from './setDifference';

export type Edge<EdgeMetadata> = { src: string, dst: string, metadata: EdgeMetadata };
export interface Graph<Node, EdgeMetadata> {
	_nodes: { [key: string]: Node };
	_edges: { [key: string]: Edge<EdgeMetadata> };
}


export const empty = () => ({ _nodes: {}, _edges: {} });

// Returns a shallow clone of the input graph.
export function clone<N, E>(graph: Graph<N, E>): Graph<N, E> {
	return { ...graph };
}


// -- Accessors

export function nodeForKey<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	key: string
): Node | null {
	return graph._nodes[key];
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

export function allNodes<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>
): Record<string, Node> {
	return graph._nodes;
}

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

export function filterEdges<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	predicate: (metadata: Edge<EdgeMetadata>) => boolean
): { [edgeKey: string]: Edge<EdgeMetadata> } {
	return pickBy(graph._edges, edge => predicate(edge)) as Record<string, Edge<EdgeMetadata>>;
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


// -- Mutations

export function insertEdge<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	edge: Edge<EdgeMetadata>,
	key: string
): Graph<Node, EdgeMetadata> {
	graph._edges[key] = edge;
	return graph;
}

export function insertNode<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	node: Node,
	key: string
): Graph<Node, EdgeMetadata> {
	graph._nodes[key] = node;
	return graph;
}

export function removeEdge<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	keyToRemove: string
): Graph<Node, EdgeMetadata> {
	delete graph._edges[keyToRemove];
	return graph;
}

export function mutateNode<Node, EdgeMetadata>(
	graph: Graph<Node, EdgeMetadata>,
	nodeKey: string,
	transform: (original: Node) => Node
): Graph<Node, EdgeMetadata> {
	if (graph._nodes[nodeKey] != null) {
		graph._nodes[nodeKey] = transform(graph._nodes[nodeKey]);
	}

	return graph;
}

export function mapNodes<TransformedNode, OriginalNode, EdgeMetadata>(
	graph: Graph<OriginalNode, EdgeMetadata>,
	outputGraph: Graph<TransformedNode, EdgeMetadata>,
	transform: (original: OriginalNode) => TransformedNode,
): Graph<TransformedNode, EdgeMetadata> {
	for (const key of Object.keys(graph._nodes)) {
		outputGraph._nodes[key] = transform(graph._nodes[key]) as any;
	}
	return outputGraph;
}

export function mapEdges<TransformedEdgeWeight, OriginalEdgeWeight, Node>(
	graph: Graph<Node, OriginalEdgeWeight>,
	outputGraph: Graph<Node, TransformedEdgeWeight>,
	transform: (original: OriginalEdgeWeight, src: string, dst: string) => TransformedEdgeWeight,
): Graph<Node, TransformedEdgeWeight> {
	for (const key of Object.keys(graph._nodes)) {
		const edge = graph._edges[key];
		outputGraph._edges[key] = {
			...edge,
			metadata: transform(edge.metadata, edge.src, edge.dst)
		};
	}
	return outputGraph;
}

// TODO: Make this produce less garbage
export function transformNodeKeys<N, E>(
	graph: Graph<N, E>,
	transformKey: (nodeKey: string) => string
): Graph<N, E> {
	return {
		_nodes: mapKeys(graph._nodes, (_, key) => transformKey(key)),
		_edges: mapValues(graph._edges, edge => ({
			...edge,
			src: transformKey(edge.src),
			dst: transformKey(edge.dst),
		}))
	};
}

// TODO: Make this produce less garbage
export function transformEdgeKeys<N, E>(
	graph: Graph<N, E>,
	transformKey: (edgeKey: string) => string
): Graph<N, E> {
	return {
		...graph,
		_edges: mapKeys(graph._edges, (_, key) => transformKey(key))
	};
}

// Mutates first argument.
export function merge<N, E>(
	g1: Graph<N, E>,
	g2: Graph<N, E>
): Graph<N, E> {
	const nodes = allNodes(g2);
	for (const key of Object.keys(nodes)) {
		insertNode(g1, nodes[key], key);
	}

	const edges = allEdges(g2);
	for (const key of Object.keys(edges)) {
		insertEdge(g1, edges[key], key);
	}

	return g1;
}

