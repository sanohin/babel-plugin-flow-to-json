// @flow

type Baz = {
    foo: string,
    bar: number
};

type Foo = 'someStr' | 46 | Baz | null;

class Bar {
    // $flow-to-json
    static prop: Foo;
}
