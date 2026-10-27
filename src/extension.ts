import * as vscode from 'vscode';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
	diagnosticCollection = vscode.languages.createDiagnosticCollection('cppUnusedVars');
	context.subscriptions.push(diagnosticCollection);

	function analyzeDocument(document: vscode.TextDocument) {
		if (document.languageId !== 'cpp') {
			return;
		}
		const text = document.getText();
		const diagnostics: vscode.Diagnostic[] = [];
		const types = ['int', 'char', 'float', 'bool', 'double'];
		const words = text.split(/\s+/);
		for (let i = 0; i < words.length - 1; ++i) {
			if (types.includes(words[i])) {
				let varName = words[i + 1];
				if (varName.includes('(')) {
					continue;
				}
				varName = varName.replace(';', '');
				let count = 0;
				for (let j = 0; j < words.length; j++) {
					let cleanword = words[j].replace(';', '');
					if (cleanword === varName) {
						count++;
					}
				}
				// console.log('Nashli peremennuyu' + varName);
				// let count = text.split(varName).length - 1;
				console.log("Проверяем: " + varName + " | Найдено раз: " + count);
				if (count === 1) {
					let declaration = words[i] + " " + words[i + 1];
					let index = text.indexOf(declaration);
					let startpos = document.positionAt(index + words[i].length + 1);
					let endpos = document.positionAt(index + words[i].length + 1 + varName.length);
					let range = new vscode.Range(startpos, endpos);
					let diagnostic = new vscode.Diagnostic(range, "Переменная: " + varName + " не используется", vscode.DiagnosticSeverity.Warning);
					diagnostics.push(diagnostic);

				}
			}

		}
		diagnosticCollection.set(document.uri, diagnostics);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(analyzeDocument)
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(event => analyzeDocument(event.document))
	);
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider('cpp', new UnusedVarFixer));
}

export function deactivate() {
	diagnosticCollection.dispose();
}

class UnusedVarFixer implements vscode.CodeActionProvider {
	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		if (context.diagnostics.length == 0) {
			return [];
		}
		const action = new vscode.CodeAction("Удалить переменную", vscode.CodeActionKind.QuickFix);
		const edit = new vscode.WorkspaceEdit();
		const line = document.lineAt(range.start.line);
		edit.delete(document.uri, line.rangeIncludingLineBreak);
		action.edit = edit;
		return [action];
	}
}