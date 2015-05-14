define(function (require, exports, module) {
    "use strict";
    
    
    
    var acorn = require("../../libs/acorn");
    var acornWalk = require("../../libs/walk");
    
    
    
    // Inputs for the acorn parser
    var parserOptions = {
        ecmaVersion: 6,
        allowReturnOutsideFunction: true,
        allowImportExportEverywhere: true,
        locations: true,
        allowHashBang: true,
    };
    
    // List of AST nodes that will be output
    var displayedNodes = {
        FunctionExpression: true,
        FunctionDeclaration: true,
        ArrowFunctionExpression: true,
        GeneratorExpression: true,
        ClassDeclaration: true,
    };




    function _getName(name, stats) {
        var anonName = "";
        if (stats.isGenerator) {
            anonName = "generator";
        } else if (stats.isArrow) {
            anonName = "arrow";
        } else if (stats.isClass) {
            anonName = "class";
        } else if (stats.isMethod) {
            anonName = "method";
        }
        if (!name && !anonName) {
            anonName = "function";
        }
        return {
            name: name || anonName,
            anon: !!anonName,
        };
    }


    function _getVisibilityClass(name, depth, stats) {
        var visClass = "";
        if (stats.isGenerator) {
            visClass += " outline-entry-generator";
        } else if (stats.isArrow) {
            visClass += " outline-entry-arrow";
        } else if (stats.isClass) {
            visClass += " outline-entry-class";
        } else if (stats.isMethod) {
            visClass += " outline-entry-method";
            if (name === "constructor") {
                visClass += " outline-entry-constructor";
            }
        }
        if (!name) {
            visClass += " outline-entry-unnamed";
        } else {
            visClass += " outline-entry-" + (name[0] === "_" ? "private" : "public");
        }
        visClass += " outline-entry-depth-" + Math.min(depth, 8);
        return visClass;
    }



    function _createListEntry(name, stats, args, line, ch, depth) {
        var nameData = _getName(name, stats);
        var $elements = [];
        var $name = $(document.createElement("span"));
        $name.addClass("outline-entry-name");
        $name.text(nameData.name);
        $elements.push($name);
        var $arguments = $(document.createElement("span"));
        $arguments.addClass("outline-entry-arg");
        $arguments.text(args);
        $elements.push($arguments);
        return {
            name: name,
            isAnon: nameData.anon,
            line: line,
            ch: ch,
            classes: "outline-entry-js outline-entry-icon" + _getVisibilityClass(name, depth, stats),
            $html: $elements
        };

    }


    // Takes an array of spidermonkey nodes and outputs a string.
    function _getParamString(nodes) {
        if (nodes) {
            return "(" + nodes.map(function (v) {
                return (v && v.name) || "?";
            }).join(", ") + ")";
        } else {
            return "(?)";
        }
    }




    /**
     * Create the entry list of functions language dependent.
     * @param   {Array}   text          Documents text with normalized line endings.
     * @param   {Boolean} showArguments args Preference.
     * @param   {Boolean} showUnnamed   unnamed Preference.
     * @returns {Array}   List of outline entries.
     */
    function getOutlineList(text, showArguments, showUnnamed, willSort) {
        var output = [];

        // Parse the input file. This outputs a data structure according
        // to this: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
        var tree;
        try {
            tree = acorn.parse(text, parserOptions);
        } catch (e) {
            // Syntax error, just eat it.
            return [];
        }


        // Walker function for the acorn AST
        function _processASTNode(node, state, c) {
            

            // Read the name from the node. FunctionExpressions do not have a name.
            var name = (node.id && node.id.name) || "";
            var parent = state.ancestors[state.ancestors.length - 1];
            var args = "";
            var isMethod = false;
            var isClass = false;


            // Class methods have a MethodDefinition that contains a FunctionExpression
            // so pull the name from the parent MethodDefinition if one exists.
            if (parent && parent.type === "MethodDefinition") {
                name = state.ancestors[state.ancestors.length - 1].key.name;
                isMethod = true;
            }


            // If the parent is an assignment, take the variable we're assigning to and
            // make that the name.
            if (parent && parent.type === "AssignmentExpression") {
                if (parent.left && parent.left.property && parent.left.property.name) {
                    name = parent.left.property.name;
                    if (parent.left && parent.left.object && parent.left.object.name) {
                        if (parent.left.computed) {
                            name = parent.left.object.name + "[" + name + "]";
                        } else {
                            name = parent.left.object.name + "." + name;
                        }
                    }
                }
            }
            
            // Variable declarations are not assignments, so detect vars seperately
            if (parent && parent.type === "VariableDeclarator") {
                name = parent.id && parent.id.name;
            }


            // If the parent is a property, take the property name if it is not computed.
            if (!name && parent && parent.type === "Property") {
                if (parent && parent.key && parent.key.name) {
                    name = parent.key.name;
                }
            }


            // If this node has params (FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)
            // they are output.
            if (showArguments && node.params) {
                args = _getParamString(node.params);
            }


            // If this node is a class, set args to it's superclass.
            // If the code does something like
            // `class extends require("./something")`
            // it will show "extends <expression>"
            if (node.type === "ClassDeclaration") {
                isClass = true;
                if (node.superClass) {
                    if (node.superClass.name) {
                        args = node.superClass.name;
                    } else if (node.superClass.property && node.superClass.property.name) {
                        args = node.superClass.property.name;
                        if (node.superClass.object && node.superClass.object.name) {
                            if (node.superClass.computed) {
                                args = node.superClass.object.name + "[" + args + "]";
                            } else {
                                args = node.superClass.object.name + "." + args;
                            }
                        }
                    } else {
                        args = "<expression>";
                    }
                    args = " extends " + args;
                } else {
                    args = "";
                }
            }


            // Generate the actual output node
            if (displayedNodes[node.type] && (showUnnamed || name)) {

                // Create the entry for this function
                var stats = {
                    isGenerator: node.generator,
                    isArrow: node.type === "ArrowFunctionExpression",
                    isMethod: isMethod,
                    isClass: isClass,
                };
                var loc = node.body && node.body.loc.start;
                var hasBraceAtStart = text[node.body.start] === "{";
                output.push(_createListEntry(
                    name,
                    stats,
                    args,
                    loc.line - 1,
                    loc.column + (hasBraceAtStart ? 1 : 0),
                    willSort ? 0 : state.depth
                ));

            }


            // Walk a child node. While walking the nodes, also keep track
            // of the depth and the ancestry.
            state.ancestors.push(node);
            if (displayedNodes[node.type]) {
                state.depth++;
            }
            acornWalk.base[node.type](node, state, c);
            if (displayedNodes[node.type]) {
                state.depth--;
            }
            state.ancestors.pop();


        }


        // Walk over the AST. This causes the walker to call _processASTNode
        // every time it encounters a function, generator, arrow, class or method.
        try {
            var state = {depth: 1, ancestors: []};
            acornWalk.recursive(tree, state, {
                FunctionExpression: _processASTNode,
                FunctionDeclaration: _processASTNode,
                ArrowFunctionExpression: _processASTNode,
                GeneratorExpression: _processASTNode,
                ClassDeclaration: _processASTNode,
                MethodDefinition: _processASTNode,
                AssignmentExpression: _processASTNode,
                AssignmentPattern: _processASTNode,
                Property: _processASTNode,
                CallExpression: _processASTNode,
                VariableDeclaration: function (node, st, c) {
                    // VariableDeclarators must be added to the ancestors list
                    // to detect assignments to newly declared variables.
                    for (var i = 0; i < node.declarations.length; ++i) {
                        st.ancestors.push(node.declarations[i]);
                        var decl = node.declarations[i];
                        c(decl.id, st, "Pattern");
                        if (decl.init) {
                            c(decl.init, st, "Expression");
                        }
                        st.ancestors.pop();
                    }
                },
            });
        } catch (e) {
            return [];
        }

        return output;
    }

    function compare(a, b) {
        if (b.anon) {
            return -1;
        }
        if (a.anon) {
            return 1;
        }
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    }

    module.exports = {
        getOutlineList: getOutlineList,
        compare: compare
    };
});
