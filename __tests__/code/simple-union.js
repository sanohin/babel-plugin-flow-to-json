// @flow

type Baz = {
    foo: string,
    bar: number
};

type Foo = string | Baz | null;

class Bar {
    // $flow-to-json
    static prop: Foo;
}
