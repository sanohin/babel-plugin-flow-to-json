const t = require('babel-types');

const getBinding = (path, name) => {
  const { scope } = path;
  if (scope && scope.bindings) {
    return scope.bindings[name];
  }
  return null;
};

const lookupNode = (path, name) => {
  let binding;
  let parent = path;
  while (parent) {
    binding = getBinding(parent, name);
    if (binding) {
      return binding.path.node;
    }
    parent = parent.parentPath;
  }
  return null;
};

const getLiteral = value => {
  const type = typeof value;
  if (type === 'object' && !value) {
    return t.nullLiteral();
  }
  switch (type) {
    case 'number':
      return t.numericLiteral(value);
    case 'string':
      return t.stringLiteral(value);
    case 'boolean':
      return t.booleanLiteral(value);
    default:
      console.error(value);
      throw new Error(`getLiteralFn for type: ${type} is not implemented`);
  }
};

const primitive = type =>
  t.objectExpression([
    t.objectProperty(t.identifier('type'), t.stringLiteral(type))
  ]);

module.exports = {
  getBinding,
  getLiteral,
  lookupNode,
  primitive
};
