import * as vscode from "vscode";
import { HTL_ATTRS } from "./htl";

export class HtlAttributeCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const line = document.lineAt(position.line).text.slice(0, position.character);
    const inTag = /<\w[\w-]*(\s+[^>]*)?$/.test(line);
    if (!inTag) return [];

    return Object.values(HTL_ATTRS).map((e) => {
      const item = new vscode.CompletionItem(e.title, vscode.CompletionItemKind.Property);
      item.insertText = e.title;
      item.detail = "HTL (AEM)";
      item.documentation = new vscode.MarkdownString(e.doc + (e.example ? "\n\n```html\n" + e.example + "\n```" : ""));
      return item;
    });
  }

  resolveCompletionItem?(item: vscode.CompletionItem): vscode.ProviderResult<vscode.CompletionItem> {
    return item;
  }
}