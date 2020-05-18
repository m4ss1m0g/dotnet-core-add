import * as glob from "glob";
import * as path from "path";
import * as stringSanitizer from "string-sanitizer";
import * as fs from "fs";

const CSPROJ = "csproj";

export default class FileHelpers {
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
     * Looking for specified filePath and extension using globa
     *
     * @private
     * @param {string} filePath The file path
     * @param {string} fileExtension The file extension
     * @returns {(Promise<string | undefined>)} The full path if found, otherwise undefined
     * @memberof FileHelpers
     */
    private async findFiles(
        filePath: string,
        fileExtension: string
    ): Promise<string | undefined> {
        const searchTerm = `${filePath}${path.sep}*.${fileExtension}`;
        return new Promise((resolve, reject) => {
            glob(searchTerm, (err, matches) => {
                if (matches.length > 0) {
                    resolve(matches[0]);
                }
                resolve(undefined);
            });
        });
    }
    /**
     *
     * Recursive function searching for specified fileExtension into specified file path
     * @private
     * @param {string} filePath The path where search
     * @param {string} fileExtension The file ext to search
     * @returns {(Promise<string | undefined>)} The full path if file is found, otherwise undefined
     * @memberof FileHelpers
     */
    private async getFullPath(
        filePath: string,
        fileExtension: string
    ): Promise<string | undefined> {
        let found = await this.findFiles(filePath, fileExtension);

        if (found) {
            return found;
        } else {
            if (filePath.length > 0) {
                let current = filePath.split(path.sep);
                let newfilePath = current
                    .slice(0, current.length - 1)
                    .join(path.sep);

                return await this.getFullPath(newfilePath, fileExtension);
            }
        }
    }

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
        return await this.getFullPath(filePath, CSPROJ);
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

            // Try to read the namespace from xml element of csproj
            let csProjNamespace = await this.getNamespaceFromCsProjXmlElement(
                csProjFullPath
            );

            // Csproj namespace not found on xml element, get the file name as namespace
            if (!csProjNamespace) {
                csProjNamespace = path.basename(
                    csProjFullPath,
                    path.extname(csProjFullPath)
                );
            }

            // Split the filename for calculating the remain namespace
            const fileArray = path.dirname(fileName).split(path.sep);
            const csProjArray = csProjFullPath.split(path.sep);

            // Get the folders difference between the csproj and file
            const fileNamespace = fileArray
                .filter((v) => csProjArray.indexOf(v) === -1)
                .join(" ");

            // Compose & sanitize the calculated namespace
            csProjNamespace = csProjNamespace.replace(/\./g, " ");
            let rawNamespace = `${csProjNamespace} ${fileNamespace}`;
            return stringSanitizer.sanitize.addFullstop(rawNamespace);
        }

        return undefined;
    }
}
