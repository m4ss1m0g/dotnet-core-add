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
    private MAX_FILES = 15;

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

    /**
     * Prompt for pickup the template file
     *
     * @returns {Promise<boolean>} True if successfully selected and existent file otherwise false
     * @memberof AddTemplate
     */
    public async selectFileAsync(): Promise<boolean> {
        let files: string[] = [];

        try {
            files = await this.getFiles();

            let selected: string | undefined;

            if (files.length === 0) {
                vscode.window.showErrorMessage(`No files inside ${this.templateFile}`);
            } else {
                if (files.length < this.MAX_FILES) {
                    selected = await vscode.window.showQuickPick(files);
                } else {
                    let t: vscode.InputBoxOptions = {};
                    t.placeHolder = 'MyTemplate.txt';
                    t.prompt = `Enter the template file name existing inside the ${this.getTemplatePath} folder`;
                    selected = await vscode.window.showInputBox(t);
                }

                if (selected) {
                    this.templateFile = path.join(this.getTemplatePath, selected);
                    const exist = await this.fileExistAsync(this.templateFile);
                    if (!exist) {
                        vscode.window.showErrorMessage(`File ${this.templateFile} not found`);
                    } else {
                        return true;
                    }
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }

        return false;
    }

    /**
     * Verify if file exist
     *
     * @private
     * @param {string} filePath The file to verify
     * @returns {Promise<boolean>} True if file exist, otherwise false
     * @memberof AddTemplate
     */
    private async fileExistAsync(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                fs.exists(filePath, (exist) => {
                    resolve(exist);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Read the content of the configured template directory
     *
     * @private
     * @returns {Promise<string[]>} List of files on directory
     * @memberof AddTemplate
     */
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

    /**
     * Return the template directory full path
     *
     * @readonly
     * @private
     * @type {string}
     * @memberof AddTemplate
     */
    private get getTemplatePath(): string {
        var cfg = new Configuration();
        return path.normalize(cfg.templateFolderPath);
    }
}
