import NamespaceItem from './models/namespace-item';
import IFilesHelpers from './interfaces/ifiles-helpers';
import ICsProjFile from './interfaces/icsproj-file';
import * as path from 'path';

const CSPROJ = 'csproj';

export default class NamespaceHelpers {
    private _fileHelpers: IFilesHelpers;

    private _csProjFile: ICsProjFile;

    /**
     *
     */
    constructor(fileHelpers: IFilesHelpers, csProjFile: ICsProjFile) {
        this._fileHelpers = fileHelpers;
        this._csProjFile = csProjFile;
    }

    /**
     * Search the csproj file starting from the folder of specified file name
     *
     * @param {string} fileName The file name folder where start
     * @returns {(Promise<string | undefined>)} THe full path of csproj if found otherwise iundefined
     * @memberof FileHelpers
     */
    public async getCsProjFileFromChildFileAsync(fileName: string): Promise<string | undefined> {
        const filePath = path.dirname(fileName);
        return await this._fileHelpers.findFullPathAsync(filePath, CSPROJ);
    }

    /**
     * Get the namespace for the specified file
     *
     * @param {string} fileName The file name
     * @returns {(Promise<string | undefined>)} The namespace if csproj is found, otherwise undefined
     * @memberof FileHelpers
     */
    public async getNamespaceFromFileAsync(fileName: string): Promise<string | undefined> {
        // Starting from the file looking on parent folder until reach the root or find the csproj
        let csProjFullPath = await this.getCsProjFileFromChildFileAsync(fileName);

        if (csProjFullPath) {
            // Glob return path separator unix style, on windows system must be converted
            csProjFullPath = path.normalize(csProjFullPath);

            // Get the namespace from csproj: csproj name OR xml element
            let csProjNs = await this.getNamespaceFromCsProjAsync(csProjFullPath);

            // Calculate subfolders namespace
            let subFoldersNs = this.getSubfoldersNamespace(fileName, csProjFullPath);

            return this.generateNamespace(subFoldersNs, csProjNs);
        }

        return undefined;
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
    private async getNamespaceFromCsProjAsync(csProjFullPath: string): Promise<NamespaceItem> {
        // Try to read the namespace from xml element of csproj
        let csProjNamespace = await this._csProjFile.readRootNamespaceAsync(csProjFullPath);

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
    private getSubfoldersNamespace(fileName: string, csProjFullPath: string): string {
        // Split the filename for calculating the remain namespace
        const fileArray = path.dirname(fileName).split(path.sep);
        const csProjArray = csProjFullPath.split(path.sep);

        // Get the folders difference between the csproj and file
        const subfoldersNamespace = this.foldersDiff(fileArray, csProjArray);

        // Sanitize & join
        const sanitized = subfoldersNamespace.map((p) => this.sanitize(p));

        return sanitized.join('.');
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
    private generateNamespace(subFoldersNamespace: string, csProjNamespace: NamespaceItem): string {
        // Compose the namespace
        if (csProjNamespace.isFromFilePath) {
            const cs = this.sanitize(csProjNamespace.value);
            return subFoldersNamespace === '' ? cs : `${cs}.${subFoldersNamespace}`;
        } else {
            return `${csProjNamespace.value}.${subFoldersNamespace}`;
        }
    }

    /**
     * Sanitize the namespace value
     *
     * @private
     * @param {string} value The value to sanitize
     * @returns {string} The sanitized value
     * @memberof NamespaceHelpers
     */
    private sanitize(value: string): string {
        var str2 = value.replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '_');
        return str2.replace(/ /g, '_');
    }

    /**
     * Return the differences between the csproj and file
     *
     * @private
     * @param {string[]} fileArray The splitted path of file
     * @param {string[]} csProjArray The splitted path of csproj
     * @returns {string[]} The differnces
     * @memberof NamespaceHelpers
     */
    private foldersDiff(fileArray: string[], csProjArray: string[]): string[] {
        // return fileArray.filter((v) => csProjArray.indexOf(v) === -1);
        return fileArray.slice(csProjArray.length -1);
    }
}
