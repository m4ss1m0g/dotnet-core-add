import AddItemFactory from './add-itemfactory';
import * as fs from 'fs';
import Configuration from '../config/configuration';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Add a new template with namespace
 * Is imperative to create a new file because from this file we could calculate
 * the csproj location and consequentilly the namespace
 *
 * @export
 * @class AddClass
 */
export default class AddTemplate extends AddItemFactory {
    private MAX_FILES = 5;

    private templateFile: string | undefined;

    /**
     * Generate the template code
     *
     * @private
     * @param {string} namespace The namespace
     * @param {string} className The class name
     * @returns {Buffer} The buffer data with class code
     * @memberof AddTemplate
     */
    protected generateCode(namespace: string, className: string): Buffer {
        if (this.templateFile) {
            let content = fs.readFileSync(this.templateFile).toString();
            content = content.replace('$namespace$', namespace);
            content = content.replace('$name$', className);
            return Buffer.from(content, 'utf8');
        }
        vscode.window.showErrorMessage('You must select a file');
        return Buffer.from('', 'utf-8');
    }

    public async selectFileAsync(): Promise<void> {
        let files: string[] = [];

        try {
            files = await this.getFiles();

            let selected: string | undefined;
            if (files.length < this.MAX_FILES) {
                selected = await vscode.window.showQuickPick(files);
            } else {
                let t: vscode.InputBoxOptions = {};
                t.placeHolder = 'MyTemplate.txt';
                t.prompt = 'Enter the template file name';
                selected = await vscode.window.showInputBox(t);
            }

            if (selected) {
                this.templateFile = path.join(this.getTemplatePath, selected);
                fs.exists(this.templateFile, async (exist) => {
                    if (exist) {
                        await this.runAsync();
                    } else {
                        vscode.window.showErrorMessage(`File ${this.templateFile} not found`);
                    }
                });
            }
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    }

    private async getFiles(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.exists(this.getTemplatePath, (exist) => {
                if (exist) {
                    fs.readdir(this.getTemplatePath, (err, files) => {
                        if (err) {
                            reject(new Error(err.message));
                        }
                        if (files.length === 0) {
                            reject(new Error(`No files on ${this.getTemplatePath}`));
                        }
                        resolve(files);
                    });
                } else {
                    reject(new Error(`Path ${this.getTemplatePath} not found`));
                }
            });
        });
    }

    private get getTemplatePath(): string {
        var cfg = new Configuration();
        return path.normalize(cfg.templateFolderPath);
    }
}
