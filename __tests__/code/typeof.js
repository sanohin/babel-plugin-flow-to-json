// @flow

const user = {
    id: 'some id',
    name: 'some name',
}

class Foo {
    // $flow-to-json
    static prop: {
        user: typeof user,
    }
}