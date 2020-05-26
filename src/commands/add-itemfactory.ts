import * as vscode from "vscode";
import * as path from "path";
import Configuration from "../config/configuration";
import NamespaceHelpers from "../namespace-helpers";
import FileHelpers from '../file-helpers';
import CsProjFile from '../csproj-file';

/**
 * Add a new csharp class with correct namespace
 * Is imperative to create a new file because from this file we could calculate
 * the csproj location and consequentilly the namespace
 *
 * @export
 * @class AddClass
 */
export default abstract class AddItemFactory {
    public async runAsync(): Promise<void> {

        const editor = vscode.window.activeTextEditor;

        // If the file is saved
        if (editor) {
            // get: full path and filename
            const fileName = editor.document.fileName;
            let itemName = path.basename(fileName, path.extname(fileName));

            // Capitalize if necessary
            const cfg = new Configuration();
            if (cfg.alwaysCapitalizeFirstLetter) {
                itemName = itemName[0].toUpperCase() + itemName.slice(1);
            }

            // Calculate the namespace, looking for csproj
            var fh = new NamespaceHelpers(new FileHelpers(), new CsProjFile());
            let namespace =
                (await fh.getNamespaceFromFileAsync(fileName)) || "notfound";

            // Generate class code
            const content = this.generateCode(namespace, itemName);

            // Write to previus saved file
            await this.writeToFileAsync(editor.document.uri, content);
        } else {
            vscode.window.showInformationMessage("Command Aborted");
        }
    }

    /**
     * Write to the file the class code
     *
     * @private
     * @param {string} fileName The file where wrote the class code
     * @param {Buffer} content The class content
     * @returns {Promise<void>} Nothing
     * @memberof AddClass
     */
    private async writeToFileAsync(
        fileName: vscode.Uri,
        content: Buffer
    ): Promise<void> {
        // Save to file
        await vscode.workspace.fs.writeFile(fileName, content);
        var doc = await vscode.workspace.openTextDocument(fileName);
        vscode.window.showTextDocument(doc);
    }

    /**
     * Generate the csharp code
     *
     * @private
     * @param {string} namespace The namespace
     * @param {string} className The class name
     * @returns {Buffer} The buffer data with class code
     * @memberof AddClass
     */
    protected abstract generateCode(
        namespace: string,
        className: string
    ): Buffer;
}
