import * as assert from "assert";
import FileHelpers from "../../file-helpers";
import * as sinon from "sinon";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';
import NamespaceHelpers from "../../namespace-helpers";

suite("Extension Test Suite", () => {
    vscode.window.showInformationMessage("Start all tests.");

    test("Sample test", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });

    test("File Helper", () => {
        const csproj = "d:\\developz\\customer\\customer.portal.csproj";
        const fileName = "d:\\developz\\customer\\controllers\\foo.cs";
        var fh = new NamespaceHelpers();

        var fullPath = sinon.stub(fh, "findFullPath");
        fullPath.withArgs("a", "a").returns(Promise.resolve(csproj));

        const result = fh.getNamespaceFromFile(fileName);
        assert.equal(result, "customer.portal.controllers");

    });
});
