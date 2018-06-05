import { setDifference } from './setDifference';

type Edge<EdgeMetadata> = { src: string, dst: string, metadata: EdgeMetadata };
export interface Graph<Node, EdgeMetadata> {
	nodes: { [key: string]: Node };
	edges: { [key: string]: Edge<EdgeMetadata> };
}

export function edgesWithSource<Node, EdgeMetadata>(
	srcKey: string,
	graph: Graph<Node, EdgeMetadata>
): { [edgeKey: string]: Edge<EdgeMetadata> } {
	const result: { [edgeKey: string]: Edge<EdgeMetadata> } = {};

	for (const edgeKey of Object.keys(graph.edges)) {
		if (graph.edges[edgeKey].src === srcKey) {
			result[edgeKey] = graph.edges[edgeKey];
		}
	}

	return result;
}

export function edgesWithDestination<Node, EdgeMetadata>(
	dstKey: string,
	graph: Graph<Node, EdgeMetadata>
): { [edgeKey: string]: Edge<EdgeMetadata> }  {
	const result: { [edgeKey: string]: Edge<EdgeMetadata> } = {};

	for (const edgeKey of Object.keys(graph.edges)) {
		if (graph.edges[edgeKey].dst === dstKey) {
			result[edgeKey] = graph.edges[edgeKey];
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
		nodes: Object.keys(graph.nodes)
			.reduce((acc, key) => {
				acc[key] = transform(graph.nodes[key]);
				return acc;
			}, {} as { [key: string]: TransformedNode }),
		edges: graph.edges
	};
}

export function mapEdges<TransformedEdgeWeight, OriginalEdgeWeight, Node>(
	graph: Graph<Node, OriginalEdgeWeight>,
	transform: (original: OriginalEdgeWeight) => TransformedEdgeWeight,
): Graph<Node, TransformedEdgeWeight> {
	return {
		nodes: graph.nodes,
		edges: Object.keys(graph.edges)
			.reduce((acc, key) => {
				acc[key] = {
					...graph.edges[key],
					metadata: transform(graph.edges[key].metadata)
				};
				return acc;
			}, {} as { [key: string]: { src: string, dst: string, metadata: TransformedEdgeWeight } }),
	};
}

