# The Simple Interpreter
A simple interpreter with terminal alike display. The work is partly inspired by the [codewar Kata] (http://www.codewars.com/kata/simple-interactive-interpreter), and the github project [web terminal] (https://github.com/clarkduvall/jsterm). **Warning**: Most of this toy project is written when I was learning javascript. So it is still undergoing significant changes. Bugs are likely to appear.

## Basic Grammar
Most of the grammar are quite similar to Python, except the definition of a function. To declare a function, use

```
fn function_name [argument0 argument1, ...] => function_body
```

For example,

```
>> fn add x y => x + y
>> add 1 3
4
```
