var assert = require('assert');
var groupCreator = require('./../index.js');
var fs = require('fs');
var expect = require('expect.js');

function fileReadResults(err, data) {
    return err || data.toString().trim();
}

function assertResults(results, key, expectedValue) {
    var actual = results[key];
    expect(actual).to.eql(expectedValue);
}

describe('Opening files', function () {
    it('should produce map with file contents', function (done) {
        var group = groupCreator();
        
        fs.readFile('./test/test1.txt', group.wrap('file1', fileReadResults));
        fs.readFile('./test/test2.txt', group.wrap('file2', fileReadResults));
        fs.readFile('./test/test3.txt', group.wrap('file3', fileReadResults));
        
        group.onAllDone(function (results) {
            assertResults(results, 'file1', 'text 1');
            assertResults(results, 'file2', 'text 2');
            assertResults(results, 'file3', 'text 3');
            
            done();
        });
    });

    it('should not call all done callback if cancelled', function (done) {
        var group = groupCreator();
        
        fs.readFile('./test/test1.txt', group.wrap('file1', function () {
           group.cancel();
           expect(group.isCancelled()).to.eql(true);
            
           setTimeout(done);
        }));

        group.onAllDone(function (results) {
            expect().fail("called all done handler unexpectedly");
        });
    });

    it('should map error in wrapped callback', function (done) {
        var group = groupCreator();
        
        fs.readFile('./test/test1.txt', group.wrap('file1', fileReadResults));
        fs.readFile('./test/test2.txt', group.wrap('file2', function () { 
            throw { erroCode: 5 };
        }));
        
        group.onAllDone(function (results) {
            assertResults(results, 'file1', 'text 1');
            expect(results['file2']).to.eql({ erroCode: 5 });
            
            done();
        });
    });

    it('should validate duplicate names', function () {
        var group = groupCreator();
        
        fs.readFile('./test/test1.txt', group.wrap('file1', fileReadResults));
        
        function testDuplicate() 
        { 
            fs.readFile('./test/test1.txt', group.wrap('file1', fileReadResults));
        }

        expect(testDuplicate).to.throwException(function (e)
        {
            expect(e).to.eql('Name "file1" already defined');
        });
    });
    
    it('should not allow double all done handler registration', function () {
        var group = groupCreator();
        
        fs.readFile('./test/test1.txt', group.wrap('file1', fileReadResults));
        group.onAllDone(function () {});
        
        function testDuplicateAllDone() {
            group.onAllDone(function () { });
        }
        
        expect(testDuplicateAllDone).to.throwException(function (e) {
            expect(e).to.eql('All done callback already defined');
        });
    });

    it('should pass context to wrapped handler', function (done) {
        var group = groupCreator();
        
        fs.readFile('./test/test1.txt', group.wrap('file1', { contextProp: 1 }, function () { 
            expect(this).to.eql({ contextProp: 1 });
            done();
        }));
    });
});