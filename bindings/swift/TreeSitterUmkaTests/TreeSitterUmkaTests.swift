import XCTest
import SwiftTreeSitter
import TreeSitterUmka

final class TreeSitterUmkaTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_umka())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Umka grammar")
    }
}
