@echo off
REM tree-sitter generate && tree-sitter parse %1%
tree-sitter generate && tree-sitter highlight --html %1%
