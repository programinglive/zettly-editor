import ts from "typescript";

export interface CodemodFileResult {
  filePath: string;
  modified: boolean;
  changes: string[];
  warnings: string[];
  outputCode: string;
}

export interface CodemodOptions {
  dryRun?: boolean;
}

interface TextReplacement {
  start: number;
  end: number;
  newText: string;
}

function getLineNumber(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function removeSpecifierFromList<T extends ts.ImportSpecifier | ts.ExportSpecifier>(
  sourceFile: ts.SourceFile,
  elements: ts.NodeArray<T>,
  target: T
): TextReplacement {
  const index = elements.indexOf(target);
  let start = target.getStart(sourceFile);
  let end = target.getEnd();

  if (index < elements.length - 1) {
    const nextEl = elements[index + 1];
    end = nextEl.getStart(sourceFile);
  } else if (index > 0) {
    const prevEl = elements[index - 1];
    start = prevEl.getEnd();
  }

  return { start, end, newText: "" };
}

function getStatementRemovalRange(
  sourceFile: ts.SourceFile,
  sourceCode: string,
  node: ts.Node
): TextReplacement {
  const start = node.getStart(sourceFile);
  let end = node.getEnd();
  if (sourceCode[end] === "\r" && sourceCode[end + 1] === "\n") {
    end += 2;
  } else if (sourceCode[end] === "\n") {
    end += 1;
  }
  return { start, end, newText: "" };
}

export function migrateFileToModern(
  filePath: string,
  sourceCode: string,
  _options: CodemodOptions = {}
): CodemodFileResult {
  void _options;

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") || filePath.endsWith(".jsx")
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS
  );

  // Refuse to transform files with syntax errors
  const parseDiagnostics = (
    sourceFile as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] }
  ).parseDiagnostics;
  if (parseDiagnostics && parseDiagnostics.length > 0) {
    const firstDiag = parseDiagnostics[0];
    const line =
      firstDiag.start !== undefined
        ? sourceFile.getLineAndCharacterOfPosition(firstDiag.start).line + 1
        : 1;
    return {
      filePath,
      modified: false,
      changes: [],
      warnings: [
        `Syntax error detected at line ${line}. Skipping transformation to prevent corrupting invalid source.`,
      ],
      outputCode: sourceCode,
    };
  }

  const changes: string[] = [];
  const warnings: string[] = [];
  const replacements: TextReplacement[] = [];

  let importedClassicEditor = false;
  let importedZettlyEditor = false;
  let importedEditorPreset = false;
  let classicEditorLocalName = "ClassicEditor";
  let zettlyEditorLocalName = "ZettlyEditor";

  // Step 1: Detect and transform @programinglive/zettly-editor imports and re-exports
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (
        ts.isStringLiteral(moduleSpecifier) &&
        moduleSpecifier.text === "@programinglive/zettly-editor"
      ) {
        const namedBindings = node.importClause?.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
          const elements = namedBindings.elements;
          let classicElement: ts.ImportSpecifier | null = null;
          let presetElement: ts.ImportSpecifier | null = null;

          for (const el of elements) {
            const importedName = el.propertyName ? el.propertyName.text : el.name.text;
            if (importedName === "ClassicEditor") {
              importedClassicEditor = true;
              classicEditorLocalName = el.name.text;
              classicElement = el;
            } else if (importedName === "ZettlyEditor") {
              importedZettlyEditor = true;
              zettlyEditorLocalName = el.name.text;
            } else if (importedName === "EditorPreset") {
              importedEditorPreset = true;
              presetElement = el;
            }
          }

          // If EditorPreset is the only specifier in this import declaration, remove the entire import
          if (presetElement && elements.length === 1) {
            replacements.push(getStatementRemovalRange(sourceFile, sourceCode, node));
            changes.push(`Removed obsolete EditorPreset import declaration`);
            return;
          }

          // Case: ClassicEditor imported without ZettlyEditor -> rewrite ClassicEditor to ZettlyEditor
          if (classicElement && !importedZettlyEditor) {
            replacements.push({
              start: classicElement.getStart(sourceFile),
              end: classicElement.getEnd(),
              newText: "ZettlyEditor",
            });
            changes.push(`Updated import: ClassicEditor -> ZettlyEditor`);
            importedZettlyEditor = true;
            zettlyEditorLocalName = "ZettlyEditor";
          } else if (classicElement && importedZettlyEditor) {
            // Both imported -> remove ClassicEditor from import list
            replacements.push(removeSpecifierFromList(sourceFile, elements, classicElement));
            changes.push(`Removed redundant ClassicEditor from imports`);
          }

          // Remove obsolete EditorPreset import if present alongside other specifiers
          if (presetElement) {
            replacements.push(removeSpecifierFromList(sourceFile, elements, presetElement));
            changes.push(`Removed obsolete EditorPreset from imports`);
          }
        }
      }
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === "@programinglive/zettly-editor" &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      const elements = node.exportClause.elements;
      let classicExport: ts.ExportSpecifier | null = null;
      let hasZettlyExport = false;
      let presetExport: ts.ExportSpecifier | null = null;

      for (const el of elements) {
        const origName = el.propertyName ? el.propertyName.text : el.name.text;
        if (origName === "ClassicEditor") {
          classicExport = el;
        } else if (origName === "ZettlyEditor") {
          hasZettlyExport = true;
        } else if (origName === "EditorPreset") {
          presetExport = el;
        }
      }

      if (presetExport && elements.length === 1) {
        replacements.push(getStatementRemovalRange(sourceFile, sourceCode, node));
        changes.push(`Removed obsolete EditorPreset re-export declaration`);
        return;
      }

      if (classicExport && !hasZettlyExport) {
        replacements.push({
          start: classicExport.getStart(sourceFile),
          end: classicExport.getEnd(),
          newText: "ZettlyEditor",
        });
        changes.push(`Updated re-export: ClassicEditor -> ZettlyEditor`);
      } else if (classicExport && hasZettlyExport) {
        replacements.push(removeSpecifierFromList(sourceFile, elements, classicExport));
        changes.push(`Removed redundant ClassicEditor from re-exports`);
      }

      if (presetExport) {
        replacements.push(removeSpecifierFromList(sourceFile, elements, presetExport));
        changes.push(`Removed obsolete EditorPreset from re-exports`);
      }
    }
  });

  // If Zettly Editor is not imported in this file (and no EditorPreset/re-export replacements), skip JSX scan
  if (!importedClassicEditor && !importedZettlyEditor && !importedEditorPreset && replacements.length === 0) {
    return {
      filePath,
      modified: false,
      changes: [],
      warnings: [],
      outputCode: sourceCode,
    };
  }

  // Step 2: Visit JSX elements for ClassicEditor and ZettlyEditor (only when imported)
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node)) {
      handleOpeningLikeElement(node.openingElement);
      if (ts.isIdentifier(node.closingElement.tagName)) {
        const closingTag = node.closingElement.tagName.text;
        if (importedClassicEditor && closingTag === classicEditorLocalName) {
          replacements.push({
            start: node.closingElement.tagName.getStart(sourceFile),
            end: node.closingElement.tagName.getEnd(),
            newText: zettlyEditorLocalName,
          });
        }
      }
    } else if (ts.isJsxSelfClosingElement(node)) {
      handleOpeningLikeElement(node);
    }
    ts.forEachChild(node, visit);
  }

  function handleOpeningLikeElement(element: ts.JsxOpeningElement | ts.JsxSelfClosingElement) {
    const tagNameNode = element.tagName;
    if (!ts.isIdentifier(tagNameNode)) return;

    const tagName = tagNameNode.text;
    const isClassic = importedClassicEditor && tagName === classicEditorLocalName;
    const isZettly = importedZettlyEditor && tagName === zettlyEditorLocalName;

    if (!isClassic && !isZettly) {
      return; // Do not touch unrelated JSX elements
    }

    if (isClassic) {
      replacements.push({
        start: tagNameNode.getStart(sourceFile),
        end: tagNameNode.getEnd(),
        newText: zettlyEditorLocalName,
      });
      changes.push(`Rewrote <${classicEditorLocalName}> tag to <${zettlyEditorLocalName}>`);
    }

    // Inspect attributes
    for (const attr of element.attributes.properties) {
      if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name)) {
        const attrName = attr.name.text;
        if (attrName === "preset") {
          const init = attr.initializer;
          if (init && ts.isStringLiteral(init)) {
            const presetVal = init.text;
            if (presetVal === "classic" || presetVal === "medium") {
              let start = attr.getStart(sourceFile);
              const end = attr.getEnd();

              // Clean up leading whitespace if preceded by space
              if (start > 0 && /\s/.test(sourceCode[start - 1])) {
                start -= 1;
              }

              replacements.push({
                start,
                end,
                newText: "",
              });
              changes.push(`Removed obsolete preset="${presetVal}" attribute`);
            } else {
              warnings.push(
                `Unrecognized preset="${presetVal}" attribute at line ${getLineNumber(
                  sourceFile,
                  attr
                )}. Manual review required.`
              );
            }
          } else if (init && ts.isJsxExpression(init)) {
            warnings.push(
              `Dynamic preset expression detected at line ${getLineNumber(
                sourceFile,
                attr
              )}. Preserved to prevent ambiguous modification.`
            );
          }
        } else if (attrName === "toolbar") {
          warnings.push(
            `Obsolete toolbar prop detected on <${tagName}> at line ${getLineNumber(
              sourceFile,
              attr
            )}. Top static toolbar is removed in modern architecture.`
          );
        }
      }
    }
  }

  if (importedClassicEditor || importedZettlyEditor) {
    visit(sourceFile);
  }

  if (replacements.length === 0) {
    return {
      filePath,
      modified: false,
      changes: [],
      warnings,
      outputCode: sourceCode,
    };
  }

  // Sort replacements descending by start position to safely apply them from end to start
  replacements.sort((a, b) => b.start - a.start);

  let outputCode = sourceCode;
  for (const rep of replacements) {
    outputCode = outputCode.slice(0, rep.start) + rep.newText + outputCode.slice(rep.end);
  }

  return {
    filePath,
    modified: true,
    changes,
    warnings,
    outputCode,
  };
}
