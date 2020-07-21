import * as vscode from "vscode";
import FileHelpers from "../file-helpers";
import * as path from "path";
import AddItemFactory from './add-itemfactory';


/**
 * Add a new csharp class with correct namespace
 * Is imperative to create a new file because from this file we could calculate 
 * the csproj location and consequentilly the namespace
 *
 * @export
 * @class AddClass
 */
export default class AddClass extends AddItemFactory  {
    
    /**
     * Generate the csharp class code
     *
     * @private
     * @param {string} namespace The namespace
     * @param {string} className The class name
     * @returns {Buffer} The buffer data with class code
     * @memberof AddClass
     */
    protected generateCode(namespace: string, className: string): Buffer {
        let content: string[] = [];
        content.push(`namespace ${namespace}`);
        content.push(`{`);
        content.push(`\tpublic class ${className}`);
        content.push(`\t{`);
        content.push("\t ");
        content.push(`\t}`);
        content.push(`}`);
        return Buffer.from(content.join("\r\n"), "utf8");
    }
}
