function Interpreter() {
    this.vars = {};
    this.functions = {};
}

Interpreter.prototype.tokenize = function (program) {
    if (program === "")
        return [];

    var regex = /\s*(=>|[-+*\/\%=\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
    return program.split(regex).filter(function (s) { return !s.match(/^\s*$/); });
};

Interpreter.prototype.input = function (expression) {
    var tokens = this.tokenize(expression);
    return __eval__(tokens, this.vars, this.functions);
};

function __eval__(tokens, vars, fns) {
    var cursor = 0;
    if (tokens[cursor] == "fn") {
        cursor++;
        add_fn();
        return "";
    }

    var res = expr();
    if (cursor < tokens.length)
        throw "ERROR: Syntax error. Left over.";
    return res;
    
    function expr() {
        if (tokens.length === 0)
          return "";
      
        if (cursor + 1 < tokens.length && tokens[cursor + 1] == "=")
          return assign();
        if (fns.hasOwnProperty(tokens[cursor]))
          return eval_fn();
      
        var formula = [];
        formula.push(factor());
        while (cursor < tokens.length && /[-+*\/\%]/.test(tokens[cursor])) { 
            formula.push(tokens[cursor++]);
            if (cursor == tokens.length)
                throw "ERROR: Syntax error. No variable after operator" + tokens[cursor] + "was found.";
            formula.push(factor());
        }
        return form2val(formula);
    }
    
    function form2val(formula) {
        if (formula.length === 0)
            return 0;

        var res = [];
        res.push(formula[0]);
        var pos = 1;
        while (pos < formula.length) {
            var operator = formula[pos++];
            if (operator == "+")
                res.push(formula[pos]);
            else if (operator == "-")
                res.push(-formula[pos]);
            else if (operator == "*")
                res.push(res.pop() * formula[pos]);
            else if (operator == "%")
                res.push(res.pop() % formula[pos]);
            else if (operator == "/")
                res.push(res.pop() / formula[pos]);
        }
        return res.reduce(function (a, b) { return a + b; });
    }
    
    function factor() {
        if (tokens[cursor] == "(") {
            cursor++;
            var res = expr();
            if (cursor == tokens.length)
                throw "ERROR: Syntax error. Unbalanced parathesis";
            cursor++;
            return res;
        } else if (/[0-9.]/.test(tokens[cursor][0])) { /* number */
            return parseFloat(tokens[cursor++]);
        } else if (/[A-Za-z_]/.test(tokens[cursor][0])) { /* id */
            var id = tokens[cursor++];
            if (vars.hasOwnProperty(id))
                return vars[id];
            throw "ERROR: Invalid identifier. No variable with name " + id + " was found.";
        }
        throw "ERROR: Syntax error. Invalid token " + tokens[cursor];
    }

    function assign() {
        var id = tokens[cursor++];
        if (fns.hasOwnProperty(id))
            throw "ERROR: Name conflict. Function name already occupied by a variable";
        if (++cursor == tokens.length)
            throw "ERROR: Syntax error. No variable was found in the right hand side of assignment.";
        vars[id] = expr();
        return vars[id];
    }
    
    function add_fn() {
        if (cursor == tokens.length)
            throw "ERROR: Syntax error. No function name declared.";
        var fn_name = tokens[cursor++];
        if (vars.hasOwnProperty(fn_name)) 
            throw "ERROR: Name conflict. Function name already occupied by a variable";
        var fn_obj = {"argc":cursor, "args": {}, "arg_order": [], "body": []};
        while (cursor < tokens.length && tokens[cursor] != "=>") {
            if (fn_obj.args.hasOwnProperty(tokens[cursor]))
                throw "ERROR: Name conflict. Duplicate arguments";
            fn_obj.args[tokens[cursor]] = 0;
            fn_obj.arg_order.push(tokens[cursor]);
            cursor++;
        }
        fn_obj.argc = cursor - fn_obj.argc;
        if (cursor++ >= tokens.length - 1)
            throw "ERROR: Syntax error. Invalid function definition -- function body not found.";
        while (cursor < tokens.length) {
            if (/[A-Za-z_]/.test(tokens[cursor][0]) && /* id, not number */
               (cursor == tokens.length - 1 || /[-+*\/\%]/.test(tokens[cursor])) && /* variable id, not fn */
               !fn_obj.args.hasOwnProperty(tokens[cursor])) /* not found in the argument list*/
                throw "ERROR: Invalid identifier.";
            fn_obj.body.push(tokens[cursor++]);
        }
        fns[fn_name] = fn_obj;
    }
    
    function eval_fn() {
        var fn_obj = fns[tokens[cursor++]];
        for (var i = 0; i < fn_obj.argc; i++) {
            if (cursor == tokens.length)
                throw "ERROR: Not enough arguments.";
            fn_obj.args[fn_obj.arg_order[i]] = expr();
        }
        return __eval__(fn_obj.body, fn_obj.args, fns);
    }
}
