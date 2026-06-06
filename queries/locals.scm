(program) @local.scope
(block) @local.scope
(compositeLiteral) @local.scope

(fnDecl name: (ident) @local.definition.function)
(methodDecl name: (ident) @local.definition.method)
(typeDeclItem name: (ident) @local.definition.type)
(constDeclItem name: (ident) @local.definition.constant)
(enumItem name: (ident) @local.definition.constant)

(varDeclItem identifiers: (typedIdentList (identList (ident) @local.definition.var)))
(localIdentList (ident) @local.definition.var)
(forInHeader index: (ident) @local.definition.var)
(forInHeader value: (ident) @local.definition.var)
(typedSwitchStmtHeader name: (ident) @local.definition.var)

(parameterList params: (typedIdentList (identList (ident) @local.definition.parameter)))
(rcvSignature name: (ident) @local.definition.parameter)
(captures (ident) @local.definition.parameter)

(ident) @local.reference
