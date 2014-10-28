parallel-io
===========

Very simple utility to make Node source code with parallel IO operations look better

```js
var groupCreator = require('parallel-io');
var fs = require('fs');

var group = groupCreator();

fs.readFile('./text1.txt', group.wrap('op1', function (err, data) {
    return data.toString();
}));

fs.readFile('./text2.txt', group.wrap('op2', function (err, data) {
    return data.toString();
}));

group.onAllDone(function (results) { 
    results['op1'] === "file 1 contents";
    results['op2'] === "file 2 contents";
});
```