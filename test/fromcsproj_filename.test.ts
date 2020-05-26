import NamespaceHelpers from '../src/namespace-helpers';
import IFilesHelpers from '../src/interfaces/ifiles-helpers';
import ICsProjFile from '../src/interfaces/icsproj-file';

describe('Namespace from csproj file name', () => {
    let icsproj: ICsProjFile;

    beforeAll(() => {
        icsproj = {
            readRootNamespaceAsync: jest.fn(() => {
                return Promise.resolve(undefined);
            }),
        };
    });

    describe('With standard csproj fileName', () => {
        test('Should return correct namespace with single folder', async () => {
            const csproj = 'd:\\developz\\customer\\customer.portal.csproj';
            const fileName = 'd:\\developz\\customer\\controllers\\foo.cs';

            const ifile: IFilesHelpers = {
                findFullPathAsync: jest.fn(() => {
                    return Promise.resolve(csproj);
                }),
            };

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('customer.portal.controllers');
        });

        test('Should return correct namespace with two level', async () => {
            const csproj = 'd:\\developz\\customer\\customer.portal.csproj';
            const fileName = 'd:\\developz\\customer\\controllers\\foo\\bar.cs';

            const ifile: IFilesHelpers = {
                findFullPathAsync: jest.fn(() => {
                    return Promise.resolve(csproj);
                }),
            };

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('customer.portal.controllers.foo');
        });

        test('Should return correct namespace with three level', async () => {
            const csproj = 'd:\\developz\\customer\\customer.portal.csproj';
            const fileName = 'd:\\developz\\customer\\controllers\\foo\\bar\\baz.cs';

            const ifile: IFilesHelpers = {
                findFullPathAsync: jest.fn(() => {
                    return Promise.resolve(csproj);
                }),
            };

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('customer.portal.controllers.foo.bar');
        });
    });

    describe('With csproj special name', () => {
        test('Should return correct csproj namespace with space on fileName', async () => {
            const csproj = 'd:\\developz\\customer\\customer portal.csproj';
            const fileName = 'd:\\developz\\customer\\controllers\\foo.cs';

            const ifile: IFilesHelpers = {
                findFullPathAsync: jest.fn(() => {
                    return Promise.resolve(csproj);
                }),
            };

            const icsproj: ICsProjFile = {
                readRootNamespaceAsync: jest.fn(() => {
                    return Promise.resolve(undefined);
                }),
            };

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('customer_portal.controllers');
        });

        test('Should return correct csproj namespace with @ on fileName', async () => {
            const csproj = 'd:\\developz\\customer\\customer@portal.csproj';
            const fileName = 'd:\\developz\\customer\\controllers\\foo.cs';

            const ifile: IFilesHelpers = {
                findFullPathAsync: jest.fn(() => {
                    return Promise.resolve(csproj);
                }),
            };

            const icsproj: ICsProjFile = {
                readRootNamespaceAsync: jest.fn(() => {
                    return Promise.resolve(undefined);
                }),
            };

            var fh = new NamespaceHelpers(ifile, icsproj);

            const result = await fh.getNamespaceFromFileAsync(fileName);
            expect(result).toBe('customer_portal.controllers');
        });
    });
});
