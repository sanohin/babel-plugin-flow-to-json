// @flow

type Baz = {
    foo: string,
    bar: number
};

type Foo = {
    baz: Array<Baz>,
    qux: Baz,
    quux: Array<{
        foo: string,
        bar: number
    }>,
    foo: {
        bar: Array<Baz>
    }
};

class Bar {
    // $flow-to-json
    static prop: Foo;
}
