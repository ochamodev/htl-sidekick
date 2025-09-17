import * as vscode from "vscode";
import { HTL_ATTRS, EXPRESSION_HOVER_MD } from "./htl";

const ATTR_RE = /(\bdata-sly-[a-z]+)(?:\.[\w-]+)?\b/;

function findAttrAt(doc: vscode.TextDocument, pos: vscode.Position): string | undefined {
  const range = doc.getWordRangeAtPosition(pos, /data-sly-[\w.-]+/);
  if (!range) return;
  const word = doc.getText(range);
  const m = word.match(ATTR_RE);
  return m ? m[1] : undefined; // base attribute name
}

function isInsideExpression(doc: vscode.TextDocument, pos: vscode.Position): boolean {
  const line = doc.lineAt(pos.line).text;
  let i = pos.character - 1;
  while (i >= 0) {
    if (line[i] === "}") break;
    if (line[i] === "$" && i + 1 < line.length && line[i + 1] === "{") return true;
    i--;
  }
  return false;
}

export class HtlHoverProvider implements vscode.HoverProvider {
  provideHover(doc: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    const attr = findAttrAt(doc, position);
    if (attr && HTL_ATTRS[attr]) {
      const entry = HTL_ATTRS[attr];
      const md = new vscode.MarkdownString();
      md.isTrusted = true;
      md.appendMarkdown(`**${entry.title}**\n\n${entry.doc}`);
      if (entry.example) {
        md.appendCodeblock(entry.example, "html");
      }
      md.appendMarkdown(
        `\n\n[More info (Adobe – Getting Started)](https://experienceleague.adobe.com/en/docs/experience-manager-htl/content/getting-started)`
      );
      return new vscode.Hover(md);
    }

    if (isInsideExpression(doc, position)) {
      const md = new vscode.MarkdownString();
      md.isTrusted = true;
      md.appendMarkdown(EXPRESSION_HOVER_MD);
      md.appendMarkdown(
        `\n\n[References](https://experienceleague.adobe.com/en/docs/experience-manager-htl/content/overview)`
      );
      return new vscode.Hover(md);
    }

    return undefined;
  }
}