import * as vscode from 'vscode';
import { scanContextSuggestions } from './htlScanner';

export function attachContextDiagnostics(ctx: vscode.ExtensionContext, baseCollection: vscode.DiagnosticCollection) {
    const refresh = (doc: vscode.TextDocument) => {
        if (doc.languageId !== 'htl') return;
        const existing = baseCollection.get(doc.uri) ?? [];
        const others = existing.filter(d => !String(d.code).startsWith('htl.context.'));
        const contextDiags = scanContextSuggestions(doc);
        baseCollection.set(doc.uri, [...others, ...contextDiags]);
    };
    ctx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(refresh),
        vscode.workspace.onDidChangeTextDocument(e => refresh(e.document)),
        vscode.workspace.onDidCloseTextDocument(doc => baseCollection.delete(doc.uri))
    );
    vscode.workspace.textDocuments.forEach(refresh);
}

export function registerHtlCodeActions() {
    return vscode.languages.registerCodeActionsProvider(
        { language: 'htl', scheme: 'file' },
        new HtlContextCodeActions(),
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    );
}

class HtlContextCodeActions implements vscode.CodeActionProvider {
    provideCodeActions(doc: vscode.TextDocument, range: vscode.Range, ctx: vscode.CodeActionContext) {
        const fixes: vscode.CodeAction[] = [];
        for (const d of ctx.diagnostics) {
            if (d.code === 'htl.context.uri') fixes.push(this.makeFix(doc, d, "Add @ context='uri'", 'uri'));
            if (d.code === 'htl.context.attribute') fixes.push(this.makeFix(doc, d, "Add @ context='attribute'", 'attribute'));
            if (d.code === 'htl.context.text') fixes.push(this.makeFix(doc, d, "Add @ context='text'", 'text'));
        }
        return fixes;
    }
    private makeFix(doc: vscode.TextDocument, d: vscode.Diagnostic, title: string, val: string): vscode.CodeAction {
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [d];
        action.edit = new vscode.WorkspaceEdit();
        const start = d.range.start;
        const end = d.range.end;
        const text = doc.getText(new vscode.Range(start, end));
        const closeIdx = text.lastIndexOf('}');
        const insertPos = closeIdx === -1 ? end : new vscode.Position(start.line, start.character + closeIdx);
        const toInsert = text.includes('@') ? `, context='${val}'` : ` @ context='${val}'`;
        action.edit.insert(doc.uri, insertPos, toInsert);
        return action;
    }
}
