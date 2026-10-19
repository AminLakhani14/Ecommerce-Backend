/** Small query double that supports both await and lean reads in controller tests. */
export function queryResult<T>(value: T) {
  const toPlain = (item: unknown): unknown => item && typeof item === 'object' && 'toObject' in item && typeof item.toObject === 'function' ? item.toObject() : item;
  const query = {
    select: (_fields: unknown) => query,
    sort: (_sort: unknown) => query,
    collation: (_collation: unknown) => query,
    limit: (_limit: number) => query,
    skip: (_skip: number) => query,
    lean: async () => Array.isArray(value) ? value.map(toPlain) : toPlain(value),
    then: (resolve: (value: T) => unknown, reject?: (error: unknown) => unknown) => Promise.resolve(value).then(resolve, reject),
  };
  return query;
}
