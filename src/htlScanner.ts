import * as vscode from 'vscode';

export function scanUnclosedExpressions(doc: vscode.TextDocument): vscode.Diagnostic[] {
    const diags: vscode.Diagnostic[] = [];
    const openRe = /\$\{/g;
    const closeRe = /\}/g;

    for (let i = 0; i < doc.lineCount; i++) {
        const text = doc.lineAt(i).text;
        const opens = [...text.matchAll(openRe)].map(m => m.index ?? 0);
        const closes = [...text.matchAll(closeRe)].map(m => m.index ?? 0);
        if (opens.length > closes.length) {
            const start = opens[opens.length - 1] ?? 0;
            const range = new vscode.Range(i, start, i, text.length);
            diags.push(new vscode.Diagnostic(
                range,
                "HTL expression '${ ... }' is not closed",
                vscode.DiagnosticSeverity.Warning
            ));
        }
    }
    return diags;
}

export function scanContextSuggestions(doc: vscode.TextDocument): vscode.Diagnostic[] {
    const diags: vscode.Diagnostic[] = [];
    const exprRe = /\$\{([^}]*)\}/g;

    for (let line = 0; line < doc.lineCount; line++) {
        const text = doc.lineAt(line).text;
        let m: RegExpExecArray | null;

        while ((m = exprRe.exec(text)) !== null) {
            const expr = m[1];
            const start = m.index;
            const end = m.index + m[0].length;
            const range = new vscode.Range(line, start, line, end);

            const hasContext = /@[^}]*\bcontext\s*=/.test(expr);

            const left = text.slice(0, start);
            const inAttr = /(\b[\w:-]+\b)\s*=\s*"[^"]*$/.exec(left);
            const attrName = inAttr?.[1]?.toLowerCase();

            if (!hasContext && attrName && (attrName === 'href' || attrName === 'src')) {
                const d = new vscode.Diagnostic(range, "Suggestion: add @ context='uri' for links/resources.", vscode.DiagnosticSeverity.Hint);
                d.code = 'htl.context.uri';
                diags.push(d);
                continue;
            }

            if (!hasContext && attrName && (attrName === 'title' || attrName === 'alt')) {
                const d = new vscode.Diagnostic(range, "Suggestion: add @ context='attribute' for textual attributes.", vscode.DiagnosticSeverity.Hint);
                d.code = 'htl.context.attribute';
                diags.push(d);
                continue;
            }

            if (!hasContext && !attrName) {
                const beforeGt = left.lastIndexOf('>');
                const nextLt = text.indexOf('<', end);
                if (beforeGt !== -1 && nextLt !== -1) {
                    const d = new vscode.Diagnostic(range, "Suggestion: add @ context='text' for safe text output.", vscode.DiagnosticSeverity.Hint);
                    d.code = 'htl.context.text';
                    diags.push(d);
                }
            }
        }
    }
    return diags;
}
