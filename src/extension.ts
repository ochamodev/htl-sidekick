import * as vscode from 'vscode';
import { scanUnclosedExpressions } from './htlScanner';
import { registerHtlHover } from './hover';
import { registerHtlCodeActions, attachContextDiagnostics } from './codeActions';

const HTL_ATTRS = [
    'data-sly-test', 'data-sly-list', 'data-sly-repeat', 'data-sly-include',
    'data-sly-resource', 'data-sly-use', 'data-sly-set', 'data-sly-call',
    'data-sly-template', 'data-sly-text', 'data-sly-attribute', 'data-sly-element', 'data-sly-unwrap'
];

const HTL_OPTIONS = [
    { label: "context='text'", detail: 'Escape as plain text (XSS safe)' },
    { label: "context='html'", detail: 'Allow filtered HTML' },
    { label: "context='attribute'", detail: 'HTML attribute value' },
    { label: "context='uri'", detail: 'URL-escaped output' },
    { label: "context='scriptString'", detail: 'JavaScript string literal' },
    { label: "context='styleString'", detail: 'CSS string literal' },
    { label: "context='jsonString'", detail: 'JSON string (Sling extra)' },
    { label: 'i18n', detail: 'Internationalization' },
    { label: "hint='…'", detail: 'Translator hint (i18n)' },
    { label: "locale='en-US'", detail: 'Locale (i18n)' },
    { label: "source='user'", detail: 'Dictionary (i18n)' },
    { label: 'format=[a,b]', detail: 'String.format-like substitution' },
    { label: "join=', '", detail: 'Join arrays with separator' }
];

const LIST_VARS = [
    { label: 'item', detail: 'Current element of list/repeat' },
    { label: 'itemList.index', detail: '0-based index' },
    { label: 'itemList.count', detail: '1-based counter' },
    { label: 'itemList.first', detail: 'Is first element?' },
    { label: 'itemList.middle', detail: 'Neither first nor last?' },
    { label: 'itemList.last', detail: 'Is last element?' },
    { label: 'itemList.odd', detail: 'Odd position' },
    { label: 'itemList.even', detail: 'Even position' }
];

const SELECTORS: vscode.DocumentSelector = [
    { language: 'htl', scheme: 'file' },
    { language: 'html', scheme: 'file' },
    { language: 'html', scheme: 'untitled' }
];


export function activate(ctx: vscode.ExtensionContext) {
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(
        SELECTORS,
        {
            provideCompletionItems(doc, pos) {
                const before = doc.getText(new vscode.Range(new vscode.Position(pos.line, 0), pos));
                const items: vscode.CompletionItem[] = [];

                if (before.includes('<') && !before.includes('>')) {
                    for (const a of HTL_ATTRS) {
                        const it = new vscode.CompletionItem(a, vscode.CompletionItemKind.Keyword);
                        it.insertText = new vscode.SnippetString(`${a}="\${$1}"`);
                        items.push(it);
                    }
                }

                const line = doc.lineAt(pos.line).text;
                const upto = line.substring(0, pos.character);
                const inExpr = /\$\{[^}]*$/.test(upto);
                if (inExpr) {
                    HTL_OPTIONS.forEach(o => {
                        const it = new vscode.CompletionItem('@ ' + o.label, vscode.CompletionItemKind.Property);
                        it.insertText = new vscode.SnippetString(`@ ${o.label}`);
                        it.detail = o.detail;
                        items.push(it);
                    });
                    LIST_VARS.forEach(v => {
                        const it = new vscode.CompletionItem(v.label, vscode.CompletionItemKind.Variable);
                        it.detail = v.detail;
                        items.push(it);
                    });
                }
                return items;
            }
        },
        ...['d', 'a', 't', 'a', '$', '@', '{', '.', '-']
    ));

    const collection = vscode.languages.createDiagnosticCollection('htl');
    ctx.subscriptions.push(collection);

    const refreshDiagnostics = (doc: vscode.TextDocument) => {
        if (doc.languageId !== 'htl') return;
        const diags = scanUnclosedExpressions(doc);
        collection.set(doc.uri, diags);
    };

    ctx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(refreshDiagnostics),
        vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document)),
        vscode.workspace.onDidCloseTextDocument(doc => collection.delete(doc.uri))
    );

    vscode.workspace.textDocuments.forEach(refreshDiagnostics);

    ctx.subscriptions.push(registerHtlHover());
    attachContextDiagnostics(ctx, collection);
    ctx.subscriptions.push(registerHtlCodeActions());
}

export function deactivate() { }
