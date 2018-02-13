// @flow

type Foo = {
    bar: ?string,
    baz: ?number,
    qux: ?boolean
};

class Bar {
    // $flow-to-json
    static prop: Foo;
}
