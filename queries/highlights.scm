["case" "const" "default" "enum" "fn" "map" "import" "interface" "return" "struct" "switch" "type" "var" "weak" "in"] @keyword

["if" "for"] @keyword.conditional

["=" ":=" "*" ":" "," "::" "." ";" "++" "--"] @operator

(closureLiteral "|" @keyword)

(methodDecl
	receiver: (rcvSignature name: (ident) @variable.parameter)
	name: (ident) @function.method)

(fnDecl name: (ident) @function)

(functionCall name: (qualIdent name: (ident) @function))
(functionCall name: (qualIdent name: (ident) @support.function (#match? @support.function "^(abs|append|atan|atan2|cap|ceil|copy|cos|delete|exit|exp|fabs|floor|fprintf|fscanf|insert|keys|leaksan|len|log|make|memusage|new|printf|resume|round|scanf|selfhasptr|selfptr|selftypeeq|sin|sizeof|sizeofself|slice|sort|sprintf|sqrt|sscanf|trunc|typeptr|valid|validkey)$")))
(functionCall name: (qualIdent name: (ident) @type.builtin) (#match? @type.builtin "^((str|void|int8|int16|int32|int|uint8|uint16|uint32|uint|bool|char|real32|real|fiber|any)$|[_]*[A-Z])"))
(functionCall name: (qualIdent name: (ident) @type) (#match? @type "^([_]*[A-Z])"))

(parameterList params: (typedIdentList
	(identList (ident) @variable.parameter)))

(structType (typedIdentList
    (identList (ident) @property)))

(constDeclItem name: (ident) @constant)
(enumItem) @constant
(enumLiteral name: (ident) @constant)
(stringLiteral)  @string
(stringImportLiteral)  @string
(escSeq) @string.special
(fmtSeq) @string.special
(comment) @comment
(importItem name: (ident) @module)
(typeDeclItem name: (ident) @type)
(type (qualIdent name: (ident) @type))
(qualIdent module: (ident) @module)
(modSeq name: (ident) @module)
((type) @type.builtin
	(#match? @type.builtin "^(str|void|int8|int16|int32|int|uint8|uint16|uint32|uint|bool|char|real32|real|fiber|any)$"))

((ident) @constant.builtin
	(#match? @constant.builtin "^(true|false|null)$"))

[ (decNumber) (hexNumber) (realNumber) ] @number
