// @flow

type Obj = {
    foo: string
};

type Arr = Array<number>

class Foo {
    // $flow-to-json
    static baz: Obj;
    // $flow-to-json
    static bar: Arr;
}