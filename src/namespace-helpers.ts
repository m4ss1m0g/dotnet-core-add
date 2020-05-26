import FileHelpers from "./file-helpers";
import NamespaceItem from "./models/namespace-item";
import * as path from "path";
import * as fs from "fs";
import * as stringSanitizer from 'string-sanitizer';

const CSPROJ = "csproj";

export default class NamespaceHelpers extends FileHelpers {
    /**
     * Search the csproj file starting from the folder of specified file name
     *
     * @param {string} fileName The file name folder where start
     * @returns {(Promise<string | undefined>)} THe full path of csproj if found otherwise iundefined
     * @memberof FileHelpers
     */
    public async getCsProjFileFromChildFile(
        fileName: string
    ): Promise<string | undefined> {
        const filePath = path.dirname(fileName);
        return await this.findFullPath(filePath, CSPROJ);
    }

    /**
     * Get the namespace for the specified file
     *
     * @param {string} fileName The file name
     * @returns {(Promise<string | undefined>)} The namespace if csproj is found, otherwise undefined
     * @memberof FileHelpers
     */
    public async getNamespaceFromFile(
        fileName: string
    ): Promise<string | undefined> {
        // Starting from the file looking on parent folder until reach the root or find the csproj
        let csProjFullPath = await this.getCsProjFileFromChildFile(fileName);

        if (csProjFullPath) {
            // Glob return path separator unix style, on windows system must be converted
            csProjFullPath = path.normalize(csProjFullPath);

            // Get the namespace from csproj: csporj name OR xml element
            let csProjNs = await this.getNamespaceFromCsProj(csProjFullPath);

            // Calculate subfolders namespace
            let subFoldersNs = this.getSubfoldersNamespace(
                fileName,
                csProjFullPath
            );

            return this.generateNamespace(subFoldersNs, csProjNs);
        }

        return undefined;
    }

    /**
     * Try to read the namespace from the csproj xml element
     * <RootNamespace></RootNamespace>
     *
     * @private
     * @param {string} csprojPath The csProj file path
     * @returns {(Promise<string | undefined>)} The namespace if found otherwise undefined
     * @memberof FileHelpers
     */
    private async getNamespaceFromCsProjXmlElement(
        csprojPath: string
    ): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            fs.readFile(csprojPath, { encoding: "utf8" }, (err, data) => {
                if (err) {
                    reject(err);
                }

                const matches = data
                    .toString()
                    .match(/<RootNamespace>([\w.]+)<\/RootNamespace>/);

                if (matches) {
                    resolve(matches[1]);
                }
                resolve(undefined);
            });
        });
    }

    /**
     *
     * Retrieve the namepsace from CsProj, lookong for the presence
     * of the relative XmlElement inside the csproj file or retrieve
     * from the csproj file name
     *
     * @private
     * @param {string} csProjFullPath The csproj full paht filename
     * @returns {Promise<NamespaceItem>} The Ns item
     * @memberof FileHelpers
     */
    private async getNamespaceFromCsProj(
        csProjFullPath: string
    ): Promise<NamespaceItem> {
        // Try to read the namespace from xml element of csproj
        let csProjNamespace = await this.getNamespaceFromCsProjXmlElement(
            csProjFullPath
        );

        // Csproj namespace not found on xml element, get the file name as namespace
        if (!csProjNamespace) {
            return new NamespaceItem(
                true,
                path.basename(csProjFullPath, path.extname(csProjFullPath))
            );
        } else {
            return new NamespaceItem(false, csProjNamespace);
        }
    }

    /**
     * Calculate the namespace starting from the csproj
     * ending to the file name folders
     *
     * @private
     * @param {string} fileName The filename path
     * @param {string} csProjFullPath The csproj filename path
     * @returns {string} The difference between the csproj and filename path
     * @memberof FileHelpers
     */
    private getSubfoldersNamespace(
        fileName: string,
        csProjFullPath: string
    ): string {
        // Split the filename for calculating the remain namespace
        const fileArray = path.dirname(fileName).split(path.sep);
        const csProjArray = csProjFullPath.split(path.sep);

        // Get the folders difference between the csproj and file
        // return with space between for sanitization
        const subfoldersNamespace = fileArray
            .filter((v) => csProjArray.indexOf(v) === -1)
            .join(" ");

        return subfoldersNamespace;
    }

    /**
     * Return the FULL (sanitized) namspace: csproj plus the folders
     *
     * @private
     * @param {string} subFoldersNamespace The subfolders namespace
     * @param {NamespaceItem} csProjNamespace The csporj namespace
     * @returns {string} The Full namespace
     * @memberof FileHelpers
     */
    private generateNamespace(
        subFoldersNamespace: string,
        csProjNamespace: NamespaceItem
    ): string {
        // Compose & sanitize the calculated namespace
        if (csProjNamespace.isFromFilePath) {
            const ns = csProjNamespace.value.replace(/\./g, " ");
            const rawNamespace = `${ns} ${subFoldersNamespace}`;
            return stringSanitizer.sanitize.addFullstop(rawNamespace);
        } else {
            const ns = stringSanitizer.sanitize.addFullstop(
                subFoldersNamespace
            );
            return `${csProjNamespace.value}.${ns}`;
        }
    }
}
