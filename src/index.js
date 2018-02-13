const t = require('babel-types');
const { convert } = require('./converters');

const hasComment = path => {
  const comments = path.node.leadingComments;
  return (
    Array.isArray(comments) &&
    comments.some(c => c.value.indexOf('$flow-to-json') > -1)
  );
};

const isTarget = path =>
  path.isClassProperty() &&
  path.node.static &&
  hasComment(path) &&
  path.node.typeAnnotation;

const findTargetProperties = classBody =>
  classBody.get('body').reduce((acc, cur) => {
    if (isTarget(cur)) {
      acc.push(cur);
    }
    return acc;
  }, []);

const convertWithHandler = (typeAnnotation, path) => {
  try {
    const pathT = typeAnnotation.get('typeAnnotation');
    return convert(pathT.node, pathT);
  } catch (error) {
    console.error(
      `Unable to transform property ${path.node.key.name}`
    );
    throw error;
  }
};

const search = (path) => {
  const properties = findTargetProperties(path.get('body'));
  properties.forEach(property => {
    const typeAnnotation = property.get('typeAnnotation');
    const { name } = property.node.key;
    const objectExpression = convertWithHandler(typeAnnotation, property);
    const propsClassProperty = Object.assign(
      t.classProperty(t.identifier(name), objectExpression),
      { static: true }
    );
    property.insertAfter(propsClassProperty);
  });
};

module.exports = () => ({
  name: 'flow-to-json',
  visitor: {
    Program(path) {
      path.traverse({
        ClassDeclaration: search,
        ClassExpression: search
      });
    }
  }
});
