export default interface IFilesHelpers {
    findFullPathAsync(filePath: string, fileExtension: string): Promise<string | undefined>;
}
