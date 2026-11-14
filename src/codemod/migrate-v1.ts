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

export function migrateFileToModern(
  filePath: string,
  sourceCode: string,
  options: CodemodOptions = {}
): CodemodFileResult {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") || filePath.endsWith(".jsx")
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS
  );

  const changes: string[] = [];
  const warnings: string[] = [];
  const replacements: TextReplacement[] = [];

  let importedClassicEditor = false;
  let importedZettlyEditor = false;
  let importedEditorPreset = false;
  let classicEditorLocalName = "ClassicEditor";
  let zettlyEditorLocalName = "ZettlyEditor";

  // Step 1: Detect and transform @programinglive/zettly-editor imports
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier) && moduleSpecifier.text === "@programinglive/zettly-editor") {
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
            const index = elements.indexOf(classicElement);
            let start = classicElement.getStart(sourceFile);
            let end = classicElement.getEnd();

            // Include trailing or leading comma
            if (index < elements.length - 1) {
              const nextEl = elements[index + 1];
              end = nextEl.getStart(sourceFile);
            } else if (index > 0) {
              const prevEl = elements[index - 1];
              start = prevEl.getEnd();
            }

            replacements.push({ start, end, newText: "" });
            changes.push(`Removed redundant ClassicEditor from imports`);
          }

          // Remove obsolete EditorPreset import if present
          if (presetElement) {
            const index = elements.indexOf(presetElement);
            let start = presetElement.getStart(sourceFile);
            let end = presetElement.getEnd();

            if (index < elements.length - 1) {
              const nextEl = elements[index + 1];
              end = nextEl.getStart(sourceFile);
            } else if (index > 0) {
              const prevEl = elements[index - 1];
              start = prevEl.getEnd();
            }

            replacements.push({ start, end, newText: "" });
            changes.push(`Removed obsolete EditorPreset from imports`);
          }
        }
      }
    }
  });

  // If Zettly Editor is not imported in this file, avoid touching any JSX
  if (!importedClassicEditor && !importedZettlyEditor) {
    return {
      filePath,
      modified: false,
      changes: [],
      warnings: [],
      outputCode: sourceCode,
    };
  }

  // Step 2: Visit JSX elements for ClassicEditor and ZettlyEditor
  function visit(node: ts.Node) {
    if (ts.isJsxElement(node)) {
      handleOpeningLikeElement(node.openingElement);
      if (ts.isIdentifier(node.closingElement.tagName)) {
        const closingTag = node.closingElement.tagName.text;
        if (closingTag === classicEditorLocalName) {
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
    const isClassic = tagName === classicEditorLocalName;
    const isZettly = tagName === zettlyEditorLocalName;

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
              let end = attr.getEnd();

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
                `Unrecognized preset="${presetVal}" attribute at line ${
                  sourceFile.getLineAndCharacterOfPosition(attr.getStart(sourceFile)).line + 1
                }. Manual review required.`
              );
            }
          } else if (init && ts.isJsxExpression(init)) {
            warnings.push(
              `Dynamic preset expression detected at line ${
                sourceFile.getLineAndCharacterOfPosition(attr.getStart(sourceFile)).line + 1
              }. Preserved to prevent ambiguous modification.`
            );
          }
        } else if (attrName === "toolbar") {
          warnings.push(
            `Obsolete toolbar prop detected on <${tagName}> at line ${
              sourceFile.getLineAndCharacterOfPosition(attr.getStart(sourceFile)).line + 1
            }. Top static toolbar is removed in modern architecture.`
          );
        }
      }
    }
  }

  visit(sourceFile);

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
