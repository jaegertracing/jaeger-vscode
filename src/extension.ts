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
			var extension = vscode.extensions.getExtension("auchenberg.vscode-browser-preview")
			if (extension !== undefined) {
				vscode.commands.executeCommand("browser-preview.openPreview", "http://localhost:16686")
			} else {
				vscode.env.openExternal(vscode.Uri.parse('http://localhost:16686'));
			}
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