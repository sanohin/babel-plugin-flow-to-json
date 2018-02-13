const path = require('path');
const fs = require('fs');
const babel = require('babel-core');
const flowToJson = require('../');

const testsPath = path.join(__dirname, './code');

const transform = code =>
    babel.transform(code, {
        babelrc: false,
        presets: ['env'],
        plugins: ['transform-class-properties', flowToJson, 'transform-flow-strip-types']
    }).code;

const testFile = file => {
    const text = fs.readFileSync(`${testsPath}/${file}`).toString();
    expect(transform(text)).toMatchSnapshot();
};

const files = fs.readdirSync(testsPath);
files.forEach(file => {
    test(file, () => {
        testFile(file);
    });
});
