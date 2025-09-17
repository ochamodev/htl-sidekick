import * as vscode from 'vscode';
import { HtlHoverProvider } from './hover-provider';
import { HtlAttributeCompletionProvider } from './completion-provider';

export function activate(context: vscode.ExtensionContext) {
  const langs = ["html"];
  const hover = vscode.languages.registerHoverProvider(langs, new HtlHoverProvider());
  const completion = vscode.languages.registerCompletionItemProvider(langs, new HtlAttributeCompletionProvider(), "-", ".", ":");

  context.subscriptions.push(hover, completion);
}


export function deactivate() { }
