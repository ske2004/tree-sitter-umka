["break" "case" "const" "continue" "default" "enum" "fn" "import" "in" "interface" "map" "return" "struct" "switch" "type" "var" "weak"] @keyword

["else" "for" "if"] @keyword.conditional

["++" "--"] @operator
["+" "-" "*" "/" "%" "&" "|" "~" "!" "^"] @operator
["==" "!=" "<" "<=" ">" ">=" "||" "&&" "<<" ">>"] @operator
["=" ":=" "+=" "-=" "*=" "/=" "%=" "&=" "|=" "~=" "<<=" ">>="] @operator
["?" ":"] @operator
(exportMark) @operator

["." "::"] @punctuation.delimiter
["," ";"] @punctuation.delimiter
["(" ")" "[" "]" "{" "}"] @punctuation.bracket

((ident) @variable
  (#match? @variable "^[a-z_]")
  (#set! "priority" 90))

(fnDecl name: (ident) @function)
(methodDecl receiver: (rcvSignature name: (ident) @variable.parameter))
(methodDecl name: (ident) @function.method)
(interfaceItem name: (ident) @function.method)

(parameterList params: (typedIdentList (identList (ident) @variable.parameter)))
(rcvSignature name: (ident) @variable.parameter)
(captures (ident) @variable.parameter)
(captures "|" @punctuation.bracket)
(forInHeader index: (ident) @variable)
(forInHeader value: (ident) @variable)
(typedSwitchStmtHeader name: (ident) @variable)

(accessDesignator selector: (ident) @property)
(structType (typedIdentList (identList (ident) @property)))

(builtinCall2Type name: _ @function.builtin)
(builtinCall1Type name: _ @function.builtin)
(callDesignator base: (ident) @function.builtin
  (#match? @function.builtin "^(abs|append|atan|atan2|cap|ceil|copy|cos|delete|exit|exp|fabs|floor|fprintf|fscanf|insert|keys|leaksan|len|log|memusage|printf|resume|round|scanf|selfhasptr|selfptr|selftypeeq|sin|sizeofself|slice|sort|sprintf|sqrt|sscanf|trunc|valid|validkey)$"))
(callDesignator base: (moduleIdent name: (ident) @function.call))
(callDesignator base: (accessDesignator selector: (ident) @function.method.call))
(callDesignator base: (ident) @function.call
  (#not-match? @function.call "^(abs|append|atan|atan2|cap|ceil|copy|cos|delete|exit|exp|fabs|floor|fprintf|fscanf|insert|keys|leaksan|len|log|memusage|printf|resume|round|scanf|selfhasptr|selfptr|selftypeeq|sin|sizeofself|slice|sort|sprintf|sqrt|sscanf|trunc|valid|validkey)$"))
(keyValuePair key: (ident) @property)

(constDeclItem name: (ident) @constant)
(enumItem name: (ident) @constant)
(enumLiteral name: (ident) @constant)

((ident) @constant.builtin
  (#match? @constant.builtin "^(true|false|null)$"))

(typeDeclItem name: (ident) @type)
(type (ident) @type.builtin
  (#match? @type.builtin "^(str|void|int8|int16|int32|int|uint8|uint16|uint32|uint|bool|char|real32|real|fiber|any)$"))
(type (ident) @type
  (#not-match? @type "^(str|void|int8|int16|int32|int|uint8|uint16|uint32|uint|bool|char|real32|real|fiber|any)$"))
(type (moduleIdent name: (ident) @type))
(interfaceItem type: (ident) @type.builtin
  (#match? @type.builtin "^(str|void|int8|int16|int32|int|uint8|uint16|uint32|uint|bool|char|real32|real|fiber|any)$"))
(interfaceItem type: (ident) @type
  (#not-match? @type "^(str|void|int8|int16|int32|int|uint8|uint16|uint32|uint|bool|char|real32|real|fiber|any)$"))
(interfaceItem type: (moduleIdent name: (ident) @type))

((ident) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))
(moduleIdent name: (ident) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))

(moduleIdent module: (ident) @module)
(importItem name: (ident) @module)
(modSeq) @module

(stringLiteral) @string
(multilineStringLiteral) @string
(charLiteral) @string
(stringImportLiteral) @string
(escSeq) @string.escape
(fmtSeq) @string.special

(decNumber) @number
(hexNumber) @number
(realNumber) @number.float

(comment) @comment
