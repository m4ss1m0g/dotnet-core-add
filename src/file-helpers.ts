import * as glob from "glob";
import * as path from "path";
import IFilesHelpers from './interfaces/ifiles-helpers';


export default class FileHelpers implements IFilesHelpers {
    

    /**
     * Looking for specified filePath and extension using globa
     *
     * @private
     * @param {string} filePath The file path
     * @param {string} fileExtension The file extension
     * @returns {(Promise<string | undefined>)} The full path if found, otherwise undefined
     * @memberof FileHelpers
     */
    private async findFilesAsync(
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
    public async findFullPathAsync(
        filePath: string,
        fileExtension: string
    ): Promise<string | undefined> {
        let found = await this.findFilesAsync(filePath, fileExtension);

        if (found) {
            return found;
        } else {
            if (filePath.length > 0) {
                let current = filePath.split(path.sep);
                let newfilePath = current
                    .slice(0, current.length - 1)
                    .join(path.sep);

                return await this.findFullPathAsync(newfilePath, fileExtension);
            }
        }
    }

    
}
