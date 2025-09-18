import * as vscode from "vscode";
import { expect } from "chai";

suite("HTL Helper – Hover & Completion", () => {
  test("Hover over data-sly-list and display explanation", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "html",
      content: `<ul data-sly-list="\${items}"><li>\${item}</li></ul>`
    });
    const editor = await vscode.window.showTextDocument(doc);
    const idx = doc.getText().indexOf("data-sly-list");
    const pos = doc.positionAt(idx + 5);

    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      doc.uri,
      pos
    );

    expect(hovers && hovers.length).to.be.greaterThan(0);
    const md = hovers![0].contents[0] as vscode.MarkdownString;
    expect(md.value).to.contain("Itera");
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Autocompletado sugiere data-sly-test dentro de etiqueta", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "html",
      content: `<div da`
    });
    await vscode.window.showTextDocument(doc);
    const pos = new vscode.Position(0, 7); // after 'da'
    const list = await vscode.commands.executeCommand<vscode.CompletionList>(
      "vscode.executeCompletionItemProvider",
      doc.uri,
      pos
    );
    const labels = (list?.items || []).map((i) => i.label);
    expect(labels).to.include("data-sly-test");
  });
});
