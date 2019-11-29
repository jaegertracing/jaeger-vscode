import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('jaeger.start', () => {
			cp.exec('docker run -d --name jaeger -e COLLECTOR_ZIPKIN_HTTP_PORT=9411 -p 5775:5775/udp -p 6831:6831/udp -p 6832:6832/udp -p 5778:5778 -p 16686:16686 -p 14268:14268 -p 9411:9411 jaegertracing/all-in-one:1.15', (err, stdout, stderr) => {
				if (err) {
					vscode.window.showErrorMessage(err.message)
				} else {
					vscode.window.showInformationMessage("Jaeger has started")
				}
			});
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('jaeger.ui', () => {
			JaegerUIPanel.createOrShow();
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('jaeger.stop', () => {
			cp.exec('docker stop jaeger', (err, stdout, stderr) => {
				if (err) {
					vscode.window.showErrorMessage(err.message)
				} else {
					cp.exec('docker rm jaeger', (err, stdout, stderr) => {
						if (err) {
							vscode.window.showErrorMessage(err.message)
						} else {
							vscode.window.showInformationMessage("Jaeger has stopped")
						}
					});
				}
			});
		})
	);
}

class JaegerUIPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: JaegerUIPanel | undefined;

	public static readonly viewType = 'jaegerui';

	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow() {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (JaegerUIPanel.currentPanel) {
			JaegerUIPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			JaegerUIPanel.viewType,
			'Jaeger UI',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,
			}
		);

		JaegerUIPanel.currentPanel = new JaegerUIPanel(panel);
	}

	public static revive(panel: vscode.WebviewPanel) {
		JaegerUIPanel.currentPanel = new JaegerUIPanel(panel);
	}

	private constructor(panel: vscode.WebviewPanel) {
		this._panel = panel;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		JaegerUIPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;

		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
		<html>
			<head>
				<meta charset="UTF-8">
				<title>Preview</title>
				<style>
					html { width: 100%; height: 100%; min-height: 100%; display: flex; }
					body { flex: 1; display: flex; }
					iframe { flex: 1; border: none; background: white; }
				</style>
			</head>
			<body>
				<iframe src="http://localhost:16686" >
					<p>Your browser does not support iframes.</p>
				</iframe>
			</body>
		</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
