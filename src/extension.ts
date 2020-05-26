// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import AddClass from "./commands/add-class";
import AddInterface from "./commands/add-interface";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const addClass = new AddClass();
    const addInterface = new AddInterface();

    let addClassCmd = vscode.commands.registerCommand(
        "dotnet-core-add.addClass",
        async () => {
            await addClass.runAsync();
        }
    );

    let addInterfaceCmd = vscode.commands.registerCommand(
        "dotnet-core-add.addInterface",
        async () => {
            await addInterface.runAsync();
        }
    );

    context.subscriptions.push(addClassCmd, addInterfaceCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {}
