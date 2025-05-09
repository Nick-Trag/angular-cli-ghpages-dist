"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngAdd = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const utils_1 = require("./utils");
const ngAdd = (options) => (tree, _context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const host = (0, utils_1.createHost)(tree);
    const { workspace } = yield core_1.workspaces.readWorkspace('/', host);
    if (!options.project) {
        if (workspace.projects.size === 1) {
            options.project = Array.from(workspace.projects.keys())[0];
        }
        else {
            throw new schematics_1.SchematicsException('There is more than one project in your workspace. Please select it manually by using the --project argument.');
        }
    }
    const project = workspace.projects.get(options.project);
    if (!project) {
        throw new schematics_1.SchematicsException('The specified Angular project is not defined in this workspace');
    }
    if (project.extensions.projectType !== 'application') {
        throw new schematics_1.SchematicsException(`Deploy requires an Angular project type of "application" in angular.json`);
    }
    if (!((_b = (_a = project.targets.get('build')) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.outputPath)) {
        throw new schematics_1.SchematicsException(`Cannot read the output path (architect.build.options.outputPath) of the Angular project "${options.project}" in angular.json`);
    }
    project.targets.add({
        name: 'deploy',
        builder: 'angular-cli-ghpages:deploy',
        options: {}
    });
    core_1.workspaces.writeWorkspace(workspace, host);
    return tree;
});
exports.ngAdd = ngAdd;
//# sourceMappingURL=ng-add.js.map