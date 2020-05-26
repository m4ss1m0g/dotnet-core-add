export default interface ICsProjFile {
    /**
     * Try to read the namespace from the csproj xml element
     * <RootNamespace></RootNamespace>
     *
     * @private
     * @param {string} csprojPath The csProj file path
     * @returns {(Promise<string | undefined>)} The namespace if found otherwise undefined
     * @memberof FileHelpers
     */
    readRootNamespaceAsync(csprojPath: string): Promise<string | undefined>;
}
