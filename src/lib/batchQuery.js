/** @type {import('../types').AgoricChainStoragePathKind} */
export const AgoricChainStoragePathKind = {
  Children: "children",
  Data: "data",
};

/**
 * @param {[import('../types').AgoricChainStoragePathKind, string][]} path
 * @returns {string} key
 */
export const pathToKey = (path) => path.join(".");

/**
 * @param {string} key
 * @returns {[import('../types').AgoricChainStoragePathKind, string][]}
 */
export const keyToPath = (key) => {
  const parts = key.split(".");
  return [parts[0], parts.slice(1).join(".")];
};

/**
 * @param {string} node
 * @param {import('@endo/marshall').FromCapData<string>} unmarshal
 * @param {[import('../types').AgoricChainStoragePathKind, string][]} paths
 * @returns
 */
export const batchVstorageQuery = (node, unmarshal, paths) => {
  const options = {
    method: "POST",
    body: JSON.stringify(
      paths.map((path, index) => ({
        jsonrpc: "2.0",
        id: index,
        method: "abci_query",
        params: { path: `/custom/vstorage/${path[0]}/${path[1]}` },
      }))
    ),
  };
  return fetch(node, options)
    .then((res) => res.json())
    .then((res) =>
      Object.fromEntries(
        (Array.isArray(res) ? res : [res]).map((entry) => {
          const { id: index } = entry;
          if (entry.result.response.code) {
            return [
              pathToKey(paths[index]),
              { error: entry.result.response.log },
            ];
          }

          if (!entry.result.response.value) {
            return [
              pathToKey(paths[index]),
              {
                error: `Cannot parse value of response for path [${
                  paths[index]
                }]: ${JSON.stringify(entry)}`,
              },
            ];
          }

          const data = JSON.parse(Buffer.from(
            entry.result.response.value,
            "base64"
          ).toString("binary"));

          if (paths[index][0] === AgoricChainStoragePathKind.Children) {
            return [
              pathToKey(paths[index]),
              { value: data.children, blockHeight: undefined },
            ];
          }

          const value = JSON.parse(data.value);

          const latestValueStr = Object.hasOwn(value, "values")
            ? value.values[value.values.length - 1]
            : value;
          const parsed = JSON.parse(latestValueStr);

          const shouldUnmarshal = Object.hasOwn(parsed, "slots");

          let unmarshalled;
          if (shouldUnmarshal) {
            try {
              unmarshalled = unmarshal(parsed);
            } catch (e) {
              // workaround, as unmarshal throws an error "bad board slot null" for quotes query
              const _unserialize = (value) => {
                return JSON.parse(value.body.slice(1));
              };
              unmarshalled = _unserialize(parsed);
            }
          }

          return [
            pathToKey(paths[index]),
            {
              blockHeight: value.blockHeight,
              value: shouldUnmarshal ? unmarshalled : parsed,
            },
          ];
        })
      )
    )
    .catch((e) => console.log("query error", e));
};
