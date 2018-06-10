# graph
A TypeScript implementation of a directed graph. All state is modeled as a plain object, so that it can be easily serialized.

🚧 This implementation is under construction: some operations are very slow, and the shape of the model will likely change soon. 🚧

## Features
- State is modeled as plain object for easy serialization via `JSON.stringify` / `JSON.parse`
- Store arbitrary, typesafe values on each node
- Store arbitrary, typesafe values on each edge ("weights" or "metadata")
- Constant time node / edge lookup by key

## Install

```bash
yarn add @davidisaaclee/graph
```

## Develop

```bash
# Build using tsc (does not bundle into single file)
yarn build

# Run tests
yarn test
```

## Todo
- Better test coverage
- Improve performance of common procedures (likely by changing shape of model)

