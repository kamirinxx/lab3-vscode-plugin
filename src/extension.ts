import * as vscode from 'vscode';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
	diagnosticCollection = vscode.languages.createDiagnosticCollection('cppUnusedVars');
    context.subscriptions.push(diagnosticCollection);

	function analyzeDocument(document: vscode.TextDocument) {
		if (document.languageId !== 'cpp') {
            return;
        }
		console.log("Проверяю файл: " + document.fileName);
	}

	context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(analyzeDocument)
    );

	context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => analyzeDocument(event.document))
    );
}

// This method is called when your extension is deactivated
export function deactivate() {
	diagnosticCollection.dispose();
}
