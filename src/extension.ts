// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import AddClass from './commands/add-class';
import AddInterface from './commands/add-interface';
import * as fs from 'fs';
import Configuration from './config/configuration';
import AddTemplate from './commands/add-template';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let addClassCmd = vscode.commands.registerCommand('dotnet-core-add.addClass', async () => {
        const addClass = new AddClass();
        await addClass.runAsync();
    });

    let addInterfaceCmd = vscode.commands.registerCommand(
        'dotnet-core-add.addInterface',
        async () => {
            const addInterface = new AddInterface();
            await addInterface.runAsync();
        }
    );

    let addTemplateCmd = vscode.commands.registerCommand(
        'dotnet-core-add.addTemplate',
        async () => {
            const addTemplate = new AddTemplate();
            const selected = await addTemplate.selectFileAsync();
            if (selected){
                await addTemplate.runAsync();
            }
        }
    );

    context.subscriptions.push(addClassCmd, addInterfaceCmd, addTemplateCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {}
