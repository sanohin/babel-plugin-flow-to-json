// @flow

opaque type NumberID = number;
opaque type StringID = number;

class Foo {
    // $flow-to-json
    static props: {
        id1: NumberID,
        id2: StringID
    };
}
