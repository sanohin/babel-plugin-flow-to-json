// @flow

type Baz = {
    foo: string,
    bar: number
};

type Foo = {
    bar: ?{
        foo: string
    },
    baz: ?Array<string>,
    qux: ?Baz,
    quux: { foo: number }
};

class Bar {
    // $flow-to-json
    static prop: Foo;
}
