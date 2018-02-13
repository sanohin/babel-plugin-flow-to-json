# babel-plugin-flow-to-json

[![Build Status](https://travis-ci.org/sanohin/babel-plugin-flow-to-json.svg?branch=master)](https://travis-ci.org/sanohin/babel-plugin-flow-to-json)

This plugin transforms flow types to JSON schema.
You can manually validate data at runtime.

## Example and why

```js
// animals.js
type DogProps = {
  age: number,
  color: string
};
export class Dog {
  // $flow-to-json
  static properties: DogProps;
  constructor(props: DogProps) {
    this.props = props;
    // lots of logic
  }
}
type CatProps = {
  color: string,
  hasFur: boolean
};
export class Cat {
  // $flow-to-json
  static properties: CatProps;
  constructor(props: CatProps) {
    this.props = props;
    // lots of logic
  }
}
// api.js
import Ajv from 'ajv';
import * as animanls from 'animals';

const ajv = new Ajv();

router.post('/create-animal', ctx => {
  const { type, properties: requestProps } = ctx.request.body;
  const Animal = animals[type];
  if (!Animal) {
    ctx.throw(404);
  }
  if (!ajv.validate(Animal.properties, requestProps)) {
    ctx.status = 400;
    ctx.body = ajv.errors;
    return;
  }
  // your logic
});
```

It is nice to be able to do some validation at runtime with no writing JSON schema with already implemented Flow types. The animal types above would be transformed to:

```js
export class Dog {
  // $flow-to-json
  static properties = {
    type: 'object',
    properties: {
      age: {
        type: 'number'
      },
      color: {
        type: 'string'
      }
    },
    required: ['age', 'color']
  };
  constructor(props) {
    this.props = props;
    // lots of logic
  }
}

export class Cat {
  // $flow-to-json
  static properties = {
    type: 'object',
    properties: {
      color: {
        type: 'string'
      },
      hasFur: {
        type: 'boolean'
      }
    },
    required: ['color', 'hasFur']
  };
  constructor(props) {
    this.props = props;
    // lots of logic
  }
}
```

## Usage

```sh
yarn add babel-plugin-flow-to-json
```

Be sure to remove preset `flow` and place `transform-flow-strip-types` after `flow-to-json` to keep the flow types for json schema plugin.

.babelrc

```diff
{
    "presets": [
-       "flow"
    ],
    "plugins": [
+        "flow-to-json",
+        "transform-flow-strip-types"
    ]
}
```

Plugin transforms static properties of classes with flow types and leading comment `$flow-to-json`

## More complex example

In:

```js
type Element = {
  id: number,
  name: ?string
};

type Foo = {
  baz?: number,
  qux: Array<Element | number>
};

class Bar {
  // $flow-to-json
  static prop: Foo;
}
```

Out:

```js
class Bar {
  static prop = {
    type: 'object',
    properties: {
      baz: {
        type: 'number'
      },
      qux: {
        type: 'array',
        items: {
          anyOf: [
            {
              type: 'object',
              properties: {
                id: {
                  type: 'number'
                },
                name: {
                  anyOf: [
                    {
                      type: 'null'
                    },
                    {
                      type: 'string'
                    }
                  ]
                }
              },
              required: ['id', 'name']
            },
            {
              type: 'number'
            }
          ]
        }
      }
    },
    required: ['qux']
  };
}
```

### Supported

- Object
- Array
- Union
- number, string, boolean, null
- optional key
- optional value
- literal types (fixed value)
- type aliases
- opaque types
- mixed, any

### Broken
- typeof types: `typeof prop` is ok, `typeof { a: 2, ... }` is not correct

### Not implemented
- imports
- generics
- intersection
- tuples