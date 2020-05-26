import * as fs from 'fs';
import ICsProjFile from './interfaces/icsproj-file';

export default class CsProjFile implements ICsProjFile {
    /**
     * Try to read the namespace from the csproj xml element
     * <RootNamespace></RootNamespace>
     *
     * @private
     * @param {string} csprojPath The csProj file path
     * @returns {(Promise<string | undefined>)} The namespace if found otherwise undefined
     * @memberof FileHelpers
     */
    public readRootNamespaceAsync(csprojPath: string): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            fs.readFile(csprojPath, { encoding: 'utf8' }, (err, data) => {
                if (err) {
                    reject(err);
                }

                const matches = data.toString().match(/<RootNamespace>([\w.]+)<\/RootNamespace>/);

                if (matches) {
                    resolve(matches[1]);
                }
                resolve(undefined);
            });
        });
    }
}
