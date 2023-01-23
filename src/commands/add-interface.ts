import AddItemFactory from './add-itemfactory';

/**
 * Add a new csharp interface with correct namespace
 * Is imperative to create a new file because from this file we could calculate
 * the csproj location and consequentilly the namespace
 *
 * @export
 * @class AddInterface
 */
export default class AddInterface extends AddItemFactory {
    /**
     * Generate the csharp interface code
     *
     * @private
     * @param {string} namespace The namespace
     * @param {string} itemName The item name
     * @returns {Buffer} The buffer data with class code
     * @memberof AddClass
     */
    protected generateCode(namespace: string, itemName: string): Buffer {
        let content: string[] = [];
        if (this.getConfiguration.useScopedNamespaces) {
            content.push(`namespace ${namespace};`);
            content.push(``);
            content.push(`public interface ${itemName}`);
            content.push(`{`);
            content.push(' ');
            content.push(`}`);
        } else {
            content.push(`namespace ${namespace}`);
            content.push(`{`);
            content.push(`\tpublic interface ${itemName}`);
            content.push(`\t{`);
            content.push('\t ');
            content.push(`\t}`);
            content.push(`}`);
        }
        return Buffer.from(content.join('\r\n'), 'utf8');
    }
}
