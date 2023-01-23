import * as vscode from 'vscode';

export default class Configuration {
    private config: vscode.WorkspaceConfiguration;

    /**
     *
     */
    constructor() {
        this.config = vscode.workspace.getConfiguration('dotNetCoreAdd');
    }

    public get alwaysCapitalizeFirstLetter(): boolean {
        return this.config.get<boolean>('alwaysCapitalizeFirstLetter') || false;
    }

    public get templateFolderPath(): string {
        return this.config.get<string>('templateFolderPath') || '';
    }

    public get useScopedNamespaces(): boolean {
        return this.config.get<boolean>('useScopedNamespaces') || false;
    }
}
