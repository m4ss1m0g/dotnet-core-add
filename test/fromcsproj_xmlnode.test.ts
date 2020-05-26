import NamespaceHelpers from '../src/namespace-helpers';
import IFilesHelpers from '../src/interfaces/ifiles-helpers';
import ICsProjFile from '../src/interfaces/icsproj-file';

describe('Namespace from csproj Xml Element', () => {
    const ROOT_NAMESPACE = 'Custom.Namespace';
    let ifile: IFilesHelpers;
    let icsproj: ICsProjFile;

    beforeAll(() => {
        ifile = {
            findFullPathAsync: jest.fn(() => {
                return Promise.resolve('d:\\developz\\customer\\customer.portal.csproj');
            }),
        };

        icsproj = {
            readRootNamespaceAsync: jest.fn(() => {
                return Promise.resolve(ROOT_NAMESPACE);
            }),
        };
    });

    test('Should return correct csproj namespace with single folder', async () => {
        const fileName = 'd:\\developz\\customer\\controllers\\foo.cs';

        var fh = new NamespaceHelpers(ifile, icsproj);

        const result = await fh.getNamespaceFromFileAsync(fileName);
        expect(result).toBe('Custom.Namespace.controllers');
    });

    test('Should return correct csproj namespace with two level', async () => {
        const fileName = 'd:\\developz\\customer\\controllers\\sub1\\foo.cs';

        var fh = new NamespaceHelpers(ifile, icsproj);

        const result = await fh.getNamespaceFromFileAsync(fileName);
        expect(result).toBe('Custom.Namespace.controllers.sub1');
    });

    test('Should return correct csproj namespace with three level', async () => {
        const fileName = 'd:\\developz\\customer\\controllers\\sub1\\sub2\\foo.cs';

        var fh = new NamespaceHelpers(ifile, icsproj);

        const result = await fh.getNamespaceFromFileAsync(fileName);
        expect(result).toBe('Custom.Namespace.controllers.sub1.sub2');
    });




    describe('Subfolders with special charters', () => {
        test('Should return correct value with: space', async () => {
            const fileName = 'd:\\developz\\customer\\controllers\\foo bar\\foo.cs';

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('Custom.Namespace.controllers.foo_bar');
        });

        test('Should return correct value with: @', async () => {
            const fileName = 'd:\\developz\\customer\\controllers\\foo@bar\\foo.cs';

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('Custom.Namespace.controllers.foo_bar');
        });

        test('Should return correct value with: _', async () => {
            const fileName = 'd:\\developz\\customer\\controllers\\foo_bar\\foo.cs';

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('Custom.Namespace.controllers.foo_bar');
        });

    });


});