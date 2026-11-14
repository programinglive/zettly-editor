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

const OBSOLETE_SYMBOLS = new Set(["EditorPreset", "ToolbarRenderProps", "DefaultToolbar"]);

function getLineNumber(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
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

function formatNamedSpecifier(
  sourceFile: ts.SourceFile,
  el: ts.ImportSpecifier | ts.ExportSpecifier,
  overrideText?: string
): string {
  if (overrideText) {
    const isTypeOnly = ts.isImportSpecifier(el) ? el.isTypeOnly : el.isTypeOnly;
    return isTypeOnly ? `type ${overrideText}` : overrideText;
  }
  return el.getText(sourceFile);
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
  let importedObsoleteSymbol = false;
  let classicEditorLocalName = "ClassicEditor";
  let zettlyEditorLocalName = "ZettlyEditor";
  const removedObsoleteLocalNames = new Set<string>();

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
          let hasZettly = false;

          for (const el of elements) {
            const importedName = el.propertyName ? el.propertyName.text : el.name.text;
            if (importedName === "ClassicEditor") {
              importedClassicEditor = true;
              classicEditorLocalName = el.name.text;
            } else if (importedName === "ZettlyEditor") {
              hasZettly = true;
              importedZettlyEditor = true;
              zettlyEditorLocalName = el.name.text;
            } else if (OBSOLETE_SYMBOLS.has(importedName)) {
              importedObsoleteSymbol = true;
              removedObsoleteLocalNames.add(el.name.text);
            }
          }

          const kept: string[] = [];
          let declModified = false;

          for (const el of elements) {
            const importedName = el.propertyName ? el.propertyName.text : el.name.text;
            if (importedName === "ClassicEditor") {
              declModified = true;
              if (!hasZettly) {
                kept.push(formatNamedSpecifier(sourceFile, el, "ZettlyEditor"));
                changes.push(`Updated import: ClassicEditor -> ZettlyEditor`);
                importedZettlyEditor = true;
                zettlyEditorLocalName = "ZettlyEditor";
              } else {
                changes.push(`Removed redundant ClassicEditor from imports`);
              }
            } else if (OBSOLETE_SYMBOLS.has(importedName)) {
              declModified = true;
              changes.push(`Removed obsolete ${importedName} from imports`);
              if (importedName === "DefaultToolbar") {
                warnings.push(
                  `Removed obsolete DefaultToolbar import at line ${getLineNumber(sourceFile, el)}. Top static toolbar is removed in v1.0.0.`
                );
              }
            } else {
              kept.push(formatNamedSpecifier(sourceFile, el));
            }
          }

          if (declModified) {
            if (kept.length === 0 && !node.importClause?.name) {
              replacements.push(getStatementRemovalRange(sourceFile, sourceCode, node));
            } else {
              replacements.push({
                start: namedBindings.getStart(sourceFile),
                end: namedBindings.getEnd(),
                newText: `{ ${kept.join(", ")} }`,
              });
            }
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
      let hasZettlyExport = false;

      for (const el of elements) {
        const origName = el.propertyName ? el.propertyName.text : el.name.text;
        if (origName === "ZettlyEditor") {
          hasZettlyExport = true;
        }
      }

      const kept: string[] = [];
      let declModified = false;

      for (const el of elements) {
        const origName = el.propertyName ? el.propertyName.text : el.name.text;
        if (origName === "ClassicEditor") {
          declModified = true;
          if (!hasZettlyExport) {
            kept.push(formatNamedSpecifier(sourceFile, el, "ZettlyEditor"));
            changes.push(`Updated re-export: ClassicEditor -> ZettlyEditor`);
          } else {
            changes.push(`Removed redundant ClassicEditor from re-exports`);
          }
        } else if (OBSOLETE_SYMBOLS.has(origName)) {
          declModified = true;
          changes.push(`Removed obsolete ${origName} from re-exports`);
        } else {
          kept.push(formatNamedSpecifier(sourceFile, el));
        }
      }

      if (declModified) {
        if (kept.length === 0) {
          replacements.push(getStatementRemovalRange(sourceFile, sourceCode, node));
        } else {
          replacements.push({
            start: node.exportClause.getStart(sourceFile),
            end: node.exportClause.getEnd(),
            newText: `{ ${kept.join(", ")} }`,
          });
        }
      }
    }
  });

  // If Zettly Editor is not imported in this file (and no obsolete/re-export replacements), skip JSX scan
  if (!importedClassicEditor && !importedZettlyEditor && !importedObsoleteSymbol && replacements.length === 0) {
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
      if (ts.isJsxSpreadAttribute(attr)) {
        warnings.push(
          `Spread attribute detected on <${tagName}> at line ${getLineNumber(
            sourceFile,
            attr
          )}. Verify the spread object does not pass obsolete "preset" or "toolbar" props.`
        );
        continue;
      }

      if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name)) {
        const attrName = attr.name.text;
        if (attrName === "preset") {
          const init = attr.initializer;
          let staticPresetVal: string | null = null;
          if (init && ts.isStringLiteral(init)) {
            staticPresetVal = init.text;
          } else if (
            init &&
            ts.isJsxExpression(init) &&
            init.expression &&
            (ts.isStringLiteral(init.expression) ||
              ts.isNoSubstitutionTemplateLiteral(init.expression))
          ) {
            staticPresetVal = init.expression.text;
          }

          if (staticPresetVal !== null) {
            if (staticPresetVal === "classic" || staticPresetVal === "medium") {
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
              changes.push(`Removed obsolete preset="${staticPresetVal}" attribute`);
            } else {
              warnings.push(
                `Unrecognized preset="${staticPresetVal}" attribute at line ${getLineNumber(
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

  if (removedObsoleteLocalNames.size > 0) {
    const checkDanglingRefs = (node: ts.Node) => {
      if (
        ts.isIdentifier(node) &&
        removedObsoleteLocalNames.has(node.text) &&
        !ts.isImportSpecifier(node.parent)
      ) {
        warnings.push(
          `Dangling reference to removed symbol "${node.text}" at line ${getLineNumber(
            sourceFile,
            node
          )}. Manual cleanup required.`
        );
      }
      ts.forEachChild(node, checkDanglingRefs);
    };
    ts.forEachChild(sourceFile, checkDanglingRefs);
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
