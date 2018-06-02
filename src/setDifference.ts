

export function setDifference<Node>(
	a: Set<Node>,
	b: Set<Node>
): Set<Node> {
	return new Set(Array.from(a).filter(element => !b.has(element)));
}
