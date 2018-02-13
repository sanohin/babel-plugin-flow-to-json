const t = require('babel-types');
const { lookupNode, getLiteral, primitive } = require('./utils');

const convert = (node, initialPath) => {
  if (!node) {
    throw new Error('Node is empty');
  }
  const { type } = node;
  const converter = typeConverters[type];
  if (!converter) {
    console.error(node);
    throw new Error(`No converter for node type: ${type}`);
  }
  return converter(node, initialPath);
};

const GenericTypeAnnotation = (node, initialPath) => {
  if (!node.typeParameters) {
    return convert(node.id, initialPath);
  }
  const { name } = node.id;
  if (identifierConverters[name]) {
    return identifierConverters[name](node, initialPath);
  }
  throw new Error(`Unsupported generic type ${name}`);
};

const Identifier = (node, initialPath) => {
  const { name } = node;
  if (identifierConverters[name]) {
    return identifierConverters[name](node, initialPath);
  }
  const target = lookupNode(initialPath, name);
  if (target) {
    return convert(target, initialPath);
  }
  console.warn(`Unable to convert type for ${name}`);
  return MixedTypeAnnotation();
};

const NullableTypeAnnotation = (node, initialPath) =>
  t.objectExpression([
    t.objectProperty(
      t.identifier('anyOf'),
      t.arrayExpression([
        NullLiteralTypeAnnotation(),
        convert(node.typeAnnotation, initialPath)
      ])
    )
  ]);

const IdentifierArray = (node, initialPath) => {
  const { typeParameters } = node;
  const params =
    typeParameters && typeParameters.params && typeParameters.params[0];
  const genericItemsObject = convert(params, initialPath);
  if (genericItemsObject) {
    return t.objectExpression([
      t.objectProperty(t.identifier('type'), t.stringLiteral('array')),
      t.objectProperty(t.identifier('items'), genericItemsObject)
    ]);
  }
  return primitive('array');
};

const ObjectTypeAnnotation = (node, initialPath) => {
  const targets = node.properties;
  const { properties, required } = targets.reduce(
    (acc, prop) => {
      const { optional } = prop;
      const property = convert(prop, initialPath);
      if (!optional) {
        acc.required.push(prop.key.name);
      }
      acc.properties.push(property);
      return acc;
    },
    {
      properties: [],
      required: []
    }
  );
  return t.objectExpression([
    t.objectProperty(t.identifier('type'), t.stringLiteral('object')),
    t.objectProperty(
      t.identifier('properties'),
      t.objectExpression(properties)
    ),
    t.objectProperty(
      t.identifier('required'),
      t.arrayExpression(required.map(item => t.stringLiteral(item)))
    )
  ]);
};

const ObjectTypeProperty = (node, initialPath) => {
  const { key, value } = node;
  const convertedKey = t.identifier(key.name);
  return t.objectProperty(convertedKey, convert(value, initialPath));
};

const TypeAlias = (node, initialPath) => {
  const { right } = node;
  return convert(right, initialPath);
};

const OpaqueType = (node, initialPath) => {
  const { impltype } = node;
  return convert(impltype, initialPath);
};

const getInitNode = (path, name) => {
  const node = lookupNode(path, name);
  return node ? node.init : null;
};

const TypeofTypeAnnotation = (node, path) => {
  const nextNode = node.argument.id
    ? getInitNode(path, node.argument.id.name)
    : node.argument;
  return convert(nextNode, path);
};

const UnionTypeAnnotation = (node, initialPath) => {
  const { types } = node;
  const { enums, general } = types.reduce(
    (acc, cur) => {
      if (
        cur.value &&
        cur.type !== 'IdentifierArray' &&
        cur.type !== 'NullLiteralTypeAnnotation'
      ) {
        const { value } = cur;
        acc.enums.push(getLiteral(value));
      } else {
        acc.general.push(convert(cur, initialPath));
      }
      return acc;
    },
    { enums: [], general: [] }
  );

  const result = [];
  if (enums.length) {
    result.push(
      t.objectProperty(t.identifier('enum'), t.arrayExpression(enums))
    );
  }
  if (general.length) {
    result.push(
      t.objectProperty(t.identifier('anyOf'), t.arrayExpression(general))
    );
  }
  return t.objectExpression(result);
};

// for all literals
const LiteralTypeAnnotation = node => {
  const { value } = node;
  return t.objectExpression([
    t.objectProperty(
      t.identifier('enum'),
      t.arrayExpression([getLiteral(value)])
    )
  ]);
};

const BooleanTypeAnnotation = () => primitive('boolean');

const IdentifierObject = () => primitive('object');

const AnyTypeAnnotation = () => t.objectExpression([]);

const MixedTypeAnnotation = () => t.objectExpression([]);

const NumberTypeAnnotation = () => primitive('number');

const StringTypeAnnotation = () => primitive('string');

const NullLiteralTypeAnnotation = () => primitive('null');

const identifierConverters = {
  Array: IdentifierArray,
  Object: IdentifierObject
};

const typeConverters = {
  AnyTypeAnnotation,
  BooleanLiteral: BooleanTypeAnnotation,
  BooleanLiteralTypeAnnotation: LiteralTypeAnnotation,
  BooleanTypeAnnotation,
  GenericTypeAnnotation,
  Identifier,
  MixedTypeAnnotation,
  NumericLiteral: NumberTypeAnnotation,
  NullLiteral: NullLiteralTypeAnnotation,
  NullableTypeAnnotation,
  NullLiteralTypeAnnotation,
  NumericLiteralTypeAnnotation: LiteralTypeAnnotation,
  ObjectExpression: ObjectTypeAnnotation,
  ObjectProperty: ObjectTypeProperty,
  NumberTypeAnnotation,
  ObjectTypeAnnotation,
  ObjectTypeProperty,
  OpaqueType,
  StringLiteral: StringTypeAnnotation,
  StringTypeAnnotation,
  StringLiteralTypeAnnotation: LiteralTypeAnnotation,
  TypeAlias,
  TypeofTypeAnnotation,
  UnionTypeAnnotation
};

module.exports = {
  convert
};
