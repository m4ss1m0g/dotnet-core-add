import * as vscode from "vscode";

export default class Configuration {
    private config: vscode.WorkspaceConfiguration;

    /**
     *
     */
    constructor() {
        this.config = vscode.workspace.getConfiguration("dotNetCoreAdd");
    }

    public get alwaysCapitalizeFirstLetter(): boolean {
        return (
            this.config.get<boolean>("dotNetCoreAdd.alwaysCapitalizeFirstLetter") ||
            false
        );
    }
}
