import * as vscode from 'vscode';

const DOCS: Record<string, string> = {
    'data-sly-test': '**data-sly-test**: Render only if condition is true.',
    'data-sly-list': '**data-sly-list**: Iterate a collection. Provides itemList metadata.',
    'data-sly-repeat': '**data-sly-repeat**: Repeat a block similarly to list.',
    'data-sly-include': '**data-sly-include**: Include another resource/HTL.',
    'data-sly-resource': '**data-sly-resource**: Include a Sling resource as a component.',
    'data-sly-use': '**data-sly-use**: Expose a helper or Use-API class.',
    'data-sly-set': '**data-sly-set**: Define variables.',
    'data-sly-call': '**data-sly-call**: Invoke a data-sly-template.',
    'data-sly-template': '**data-sly-template**: Define reusable template.',
    'data-sly-text': '**data-sly-text**: Print text with escaping.',
    'data-sly-attribute': '**data-sly-attribute**: Set attributes dynamically.',
    'data-sly-element': '**data-sly-element**: Change tag name.',
    'data-sly-unwrap': '**data-sly-unwrap**: Remove wrapper element.',
    'context': '**@ context**: Escaping context.',
    'i18n': '**@ i18n**: Mark for translation.',
    'hint': '**@ hint**: Translator note.',
    'locale': '**@ locale**: Force locale.',
    'source': '**@ source**: Dictionary for i18n.',
    'format': '**@ format**: Format substitution.',
    'join': '**@ join**: Join collections.'
};


const SELECTORS = [
    { language: 'html', scheme: 'file' },
    { language: 'htl', scheme: 'file' }
]

export function registerHtlHover() {
    return vscode.languages.registerHoverProvider(
        SELECTORS,
        {
            provideHover(doc, pos) {
                const range = doc.getWordRangeAtPosition(pos, /[@\w:-]+/);
                if (!range) return;
                const word = doc.getText(range).replace(/^@/, '');
                const md = DOCS[word];
                if (!md) return;
                return new vscode.Hover(new vscode.MarkdownString(md), range);
            }
        });
}
