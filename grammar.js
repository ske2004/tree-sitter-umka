const reqSemi = choice('\n', ';')
const optSeq = (...rules) => optional(seq(...rules))
const repSeq = (...rules) => repeat(seq(...rules))
const delimSeq = (delim, ...rules) => seq(optSeq(...rules), repSeq(delim, ...rules))
const delimSeq1 = (delim, ...rules) => seq(...rules, repSeq(delim, ...rules))
const delimSeq1prec = (p, delim, ...rules) => seq(...rules, prec(p, repSeq(delim, ...rules)))
const reqSemiBlock = (rule) => optional(seq(optional(rule), repSeq(reqSemi, optional(rule))))

const TERNARY_PRECEDENCE = 1
const BIN_PRECEDENCE_START = TERNARY_PRECEDENCE+1

const OPERATORS = [
  ["||"],
  ["&&"],
  ["==", "!=", "<", "<=", ">", ">="],
  ["+", "-", "|", "~"],
  ["*", "/", "%", "<<", ">>", "&"],
]

module.exports = grammar({
  name: "umka",

  inline: $ => [
    $.decl,
    $.qualIdent,
    $.toplevelDecl,
    $.stmt,
    $.simpleStmt,
    $.number,
    $.builtinCall,
    $.callStmt, // TODO: check if this is fine
    $.typedSwitchStmt,
    $.exprSwitchStmt,
    $.locals,
    $.designator,
    $.atom,
    $.expr,
    $.inferredExpr,
    $.inferredAtom,
  ],

  extras: $ => [
    $.comment,
    /\s/,
  ],

  word: $ => $.ident,

  conflicts: $ => [
    [$.signature],
    [$.localIdentList, $.typedSwitchStmtHeader],
    [$.identList, $.listStmt]
  ],

  rules: {
    program: $ => reqSemiBlock($.toplevelDecl),

    import: $ => choice(
      seq('import', $.importItem),
      seq('import', '(', reqSemiBlock($.importItem), ')')
    ),

    importItem: $ => seq(
      choice(
        seq(field('name', $.ident), '=', $.stringLiteral),
        $.stringImportLiteral
      ),
    ),

    toplevelDecl: $ => choice(
      $.import,
      $.methodDecl,
      $.fnDef,
      $.varDecl,
      $.typeDecl,
      $.constDecl,
    ),

    decl: $ => choice(
      $.fnDef,
      $.varDecl,
      $.typeDecl,
      $.constDecl,
    ),

    constDecl: $ => seq('const', choice(
      $.constDeclItem,
      seq("(", reqSemiBlock($.constDeclItem), ")"),
    )),

    constDeclItem: $ => seq(
      field('name', $.ident),
      optional($.exportMark),
      '=', field('value', $.expr),
    ),

    varDecl: $ => choice($.fullVarDecl, $.declAssignmentStmt),

    fullVarDecl: $ => seq("var", choice(
      $.varDeclItem,
      seq("(", reqSemiBlock($.varDeclItem), ")"),
    )),

    varDeclItem: $ => seq(
      field('identifiers', $.typedIdentList),
      optSeq("=", field('value', $.inferredExpr)),
    ),

    exportMark: $ => '*',

    identList: $ => prec(1, delimSeq1prec(1, ",", $.ident, optional($.exportMark))),
    localIdentList: $ => delimSeq1(",", $.ident),

    typedIdentList: $ => seq($.identList, ":", optional(".."), $.type),

    typeDecl: $ => seq(
      'type',
      choice(
        $.typeDeclItem,
        seq("(", reqSemiBlock($.typeDeclItem), ")")
      )
    ),

    typeDeclItem: $ => seq(
      field('name', $.ident),
      optional($.exportMark),
      '=', $.type,
    ),

    type: $ => choice(
      prec(-1, $.qualIdent),
      $.ptrType,
      $.arrayType,
      $.dynArrayType,
      $.enumType,
      $.structType,
      $.mapType,
      $.interfaceType,
      $.fnType,
    ),

    ptrType: $ => seq(optional("weak"), '^', $.type),
    arrayType: $ => seq('[', $.expr, ']', $.type),
    dynArrayType: $ => seq('[', ']', $.type),
    enumType: $ => seq('enum', '{', reqSemiBlock($.enumItem), '}'),
    enumItem: $ => field('name', $.ident),
    structType: $ => seq('struct', '{', reqSemiBlock($.typedIdentList), '}'),

    mapType: $ => seq('map', '[', $.type, ']', $.type),
    interfaceType: $ => seq('interface', '{', reqSemiBlock($.interfaceItem), '}'),

    interfaceItem: $ => choice(
      field('type', $.qualIdent),
      seq(field('name', $.ident), $.signature),
    ),

    fnDecl: $ => seq("fn",
      field('name', $.ident),
      optional($.exportMark),
      field('signature', $.signature),
    ),

    fnType: $ => seq("fn", field('signature', $.signature)),

    fnDef: $ => seq(
      $.fnDecl,
      optional(field('body', $.block)),
    ),

    signature: $ => seq(
      $.parameterList,
      optSeq(':', field('return', $.returnType))
    ),

    returnType: $ => choice(
      $.type,
      seq("(", $.type, repSeq(",", $.type), ")"),
    ),

    localDeclAssignmentStmt: $ => seq(
      field('identifiers', $.localIdentList),
      ":=",
      field('values', $.exprList)
    ),

    declAssignmentStmt: $ => seq(
      field('identifiers', $.identList),
      ":=",
      field('values', $.exprList)
    ),

    methodDecl: $ => seq("fn",
      field('receiver', $.rcvSignature),
      field('name', $.ident),
      optional($.exportMark),
      field('signature', $.signature),
      optional(field('body', $.block)),
    ),

    rcvSignature: $ => seq("(",
      field('name', $.ident), ":",
      field('type', $.type),
      ")"
    ),

    exprList: $ => seq($.expr, repSeq(",", $.expr)),
    inferredExprList: $ => prec(1, seq($.inferredExpr, repSeq(",", $.inferredExpr))),

    parameterList: $ => seq(
      "(",
      delimSeq(",",
        field('params', $.typedIdentList),
        optSeq('=', field('defaultValue', $.inferredExpr)),
      ),
      ")"
    ),

    block: $ => prec(1, seq("{", reqSemiBlock($.stmt), "}")),

    stmt: $ => choice(
      $.decl,
      $.ifStmt,
      $.forStmt,
      $.switchStmt,
      $.simpleStmt,
      "continue",
      "break",
      $.returnStmt,
      $.opAssignStmt,
      $.listStmt,
    ),

    opAssignStmt: $ => seq(
      field('identifier', $.designator),
      field('operator', choice("+=", "-=", "*=", "/=", "%=", "&=", "|=", "~=", "<<=", ">>=")),
      $.inferredExpr,
    ),

    listStmt: $ => prec.left(-1, seq(
      delimSeq1(",",
        choice($.inferredExpr, seq($.inferredExpr, ":", $.inferredExpr)),
      ),
      optional(","),
      optSeq("=", $.inferredExprList),
    )),

    returnStmt: $ => seq("return", optional($.inferredExprList)),

    callStmt: $ => alias($.callDesignator, 'callStmt'),

    locals: $ => seq($.localDeclAssignmentStmt, ';'),

    ifStmt: $ => seq(
      "if",
      optional($.locals),
      field('condition', $.expr),
      field('consequent', $.block),
      optSeq("else", field('alternative', choice($.ifStmt, $.block)))
    ),

    forStmt: $ => seq(
      "for",
      choice(
        $.forHeader,
        $.forInHeader,
      ),
      field('body', $.block)
    ),

    forHeader: $ => prec(1, seq(
      optional($.locals),
      field('condition', $.expr),
      optSeq(";", field('post', $.simpleStmt)),
    )),

    forInHeader: $ => prec(1, seq(
      field('index', $.ident),
      optSeq(",", field('value', seq($.ident, optional("^")))),
      "in", field('expr', $.expr),
    )),

    switchStmt: $ => choice(
      $.exprSwitchStmt,
      $.typedSwitchStmt,
    ),

    typedSwitchStmt: $ => seq(
      "switch",
      $.typedSwitchStmtHeader,
      $.typedSwitchStmtBody,
    ),

    typedSwitchStmtHeader: $ => seq(field('name', $.ident), ':=', 'type', '(', $.expr, ')'),

    typedSwitchStmtBody: $ => seq(
      '{',
      repeat(choice(
        seq('case', $.type, ':', reqSemiBlock($.stmt)),
        seq('default', ':', reqSemiBlock($.stmt)),
      )),
      '}'
    ),

    exprSwitchStmt: $ => seq(
      "switch",
      optional($.locals),
      field('value', $.expr),
      $.exprSwitchStmtBody,
    ),

    exprSwitchStmtBody: $ => seq(
      '{',
      repeat(choice(
        seq("case", $.inferredExprList, ":", reqSemiBlock($.stmt)),
        seq("default", ":", reqSemiBlock($.stmt)),
      )),
      '}'
    ),


    simpleStmt: $ => choice(
      $.incDecStmt,
      $.callStmt,
    ),

    incDecStmt: $ => seq($.designator, choice("++", "--")),

    expr: $ => choice($.ternary, $.factor, $.designator, $.binExpr, $.compositeLiteral),
    inferredExpr: $ => choice($.expr, $.inferredAtom),

    ternary: $ => prec.right(TERNARY_PRECEDENCE, seq($.expr, "?", $.expr, ":", $.expr)),
    binExpr: $ => choice(
      ...(OPERATORS.map((group, i) =>
        group.map(op => prec.left(BIN_PRECEDENCE_START+i, seq(
          $.expr,
          field('operator', op),
          $.expr,
        )))
      )).flat()
    ),

    factor: $ => choice(
      seq('+', $.designator),
      seq('-', $.designator),
      seq('~', $.designator),
      seq('!', $.designator),
      seq('&', $.designator),
    ),

    designator: $ => choice(
      $.callDesignator,
      $.arrayDesignator,
      $.derefDesignator,
      $.accessDesignator,
      $.atom,
    ),

    callDesignator: $ => seq(
      $.designator,
      $.callParams,
    ),

    callParams: $ => seq('(', delimSeq(",", $.inferredExpr), ')'),

    arrayDesignator: $ => seq(
      $.designator,
      '[', $.expr, ']'
    ),

    derefDesignator: $ => seq(
      $.designator,
      '^',
    ),

    accessDesignator: $ => seq(
      $.designator,
      '.',
      $.ident
    ),

    atom: $ => choice(
      $.charLiteral,
      $.stringLiteral,
      $.multilineStringLiteral,
      $.number,
      $.qualIdent,
      $.builtinCall,
      $.typedCompositeLiteral,
      $.enumLiteral,
      $.typeCast,
      $.parenExpr,
    ),

    inferredAtom: $ => choice($.atom, $.compositeLiteral),

    parenExpr: $ => seq('(', $.expr, ')'),

    typedCompositeLiteral: $ => seq(
      $.type,
      $.compositeLiteral,
    ),

    compositeLiteral: $ => seq(
      optSeq("|", delimSeq(",", $.ident), "|"),
      $.block,
    ),

    enumLiteral: $ => seq(".", field('name', $.ident)),
    typeCast: $ => seq($.type, '(', $.expr, ')'),

    qualIdent: $ => choice(
      $.moduleIdent,
      $.ident,
    ),

    moduleIdent: $ => seq(
      field('module', $.ident), '::', field('name', $.ident)
    ),

    builtinCall: $ => choice(
      $.builtinCall2Type,
      $.builtinCall1Type,
    ),

    builtinCall2Type: $ => seq(
      field('name', choice('make', 'new')),
      field('arguments', seq(
        "(", $.type, optSeq(',', $.inferredExpr), ")",
      ))
    ),

    builtinCall1Type: $ => seq(
      field('name', choice('sizeof', 'typeptr')),
      field('arguments', seq(
        "(", $.type, ")",
      ))
    ),

    ident: _ => token(/[A-Za-z_][A-Za-z_0-9]*/),

    number: $ => choice($.realNumber, $.hexNumber, $.decNumber),

    decNumber: _ => token(/[0-9]+/),
    hexNumber: _ => token(/0x[0-9a-fA-F]+/),

    realNumber: $ => choice(
      token(/[0-9]+\.[0-9]+/),
      token(/[0-9]+[Ee]\-?[0-9]+/),
      token(/[0-9]+\.[0-9]+[Ee]\-?[0-9]+/),
    ),

    charLiteral: $ => seq(
      "'",
      repeat(
        choice($.escSeq, token.immediate(prec(1, /[^'\n]+/)))
      ),
      "'"
    ),
    multilineStringLiteral: _ => seq(
      '`',
      repeat(token.immediate(prec(1, /[^\`]+/))),
      '`'
    ),
    stringLiteral: $ => seq(
      '"',
      repeat(
        choice($.escSeq, $.fmtSeq, token.immediate(prec(1, /[^"\n]+/)))
      ),
      '"'
    ),
    stringImportLiteral: $ => seq(
      '"',
      repeat(
        choice($.escSeq, $.modSeq, token.immediate(prec(1, /[^"\n]+/)))
      ),
      '"'
    ),

    fmtSeq: _ => prec(2, token(/\%[-+\s#0]?([0-9]+|\*)?(\.[0-9]*)?(hh|h|l|ll)?[diuxXfFeEgGscv%]/)),
    escSeq: _ => prec(2, token(choice(/\\[0abefnrtv]/, /\\x[0-9a-fA-F][0-9a-fA-F]*/))),
    modSeq: $ => prec(2, token(seq(field('name', /[A-Za-z_][A-Za-z_0-9]*/), '.um'))),

    comment: _ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  }
})
