function validateType(obj, type, error) {
    if (typeof obj !== type) {
        throw error;
    }
}

function validateWrap(resultMap, name, func) {
    validateType(name, 'string', 'Name should be a strng');
    validateType(func, 'function', 'Func should be a function');
    
    if (resultMap.hasOwnProperty(name)) {
        throw 'Name "' + name + '" already defined';
    }
}

function checkAllDone(numOfPendingOps, onAllDoneFunc, resultMap, cancelled) {
    if (!cancelled && numOfPendingOps === 0 && typeof onAllDoneFunc !== 'undefined') {
        onAllDoneFunc(resultMap);
    }
}

function ParallelGroup() {
    var resultMap = {}, 
        numOfPendingOps = 0, 
        onAllDoneFunc,
        cancelled = false;
    
    this.wrap = function (name, context, func) {
        
        if (typeof context === 'function') {
            func = context;
            context = null;
        }
        
        validateWrap(resultMap, name, func);
        
        resultMap[name] = undefined;
        numOfPendingOps++;
        context = typeof context === 'object' ? context : null;
        
        return function () {
            var result;
            try {
                result = func.apply(context, arguments);
            } catch (e) { 
                result = e;
            }
            
            resultMap[name] = result;
            numOfPendingOps--;
            checkAllDone(numOfPendingOps, onAllDoneFunc, resultMap, cancelled);
        };
    };
    
    this.onAllDone = function (func, context) {
        validateType(func, 'function', 'Func should be a function');
        if (typeof onAllDoneFunc !== 'undefined') {
            throw 'All done callback already defined';
        }
        
        onAllDoneFunc = typeof context === 'object' ? func.bind(context) : func;
        
        checkAllDone(numOfPendingOps, onAllDoneFunc, resultMap, cancelled);
    };
    
    this.cancel = function () { cancelled = true; };
    
    this.isCancelled = function () { return cancelled; };
}

function construct() {
    return new ParallelGroup();
}

module.exports = construct;