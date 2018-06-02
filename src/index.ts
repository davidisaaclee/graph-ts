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

/*
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
		for (const edgeKey of edgesWithSource(nodeKey, graph)) {
			const dst = graph.edges[edgeKey].dst;
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
*/



