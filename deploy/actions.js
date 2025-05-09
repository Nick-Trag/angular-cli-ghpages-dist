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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deploy;
const architect_1 = require("@angular-devkit/architect");
const path_1 = __importDefault(require("path"));
function deploy(engine, context, buildTarget, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.noBuild) {
            context.logger.info(`📦 Skipping build`);
        }
        else {
            if (!context.target) {
                throw new Error('Cannot execute the build target');
            }
            const overrides = Object.assign({}, (options.baseHref && { baseHref: options.baseHref }));
            context.logger.info(`📦 Building "${context.target.project}"`);
            context.logger.info(`📦 Build target "${buildTarget.name}"`);
            const build = yield context.scheduleTarget((0, architect_1.targetFromTargetString)(buildTarget.name), Object.assign(Object.assign({}, buildTarget.options), overrides));
            const buildResult = yield build.result;
            if (!buildResult.success) {
                throw new Error('Error while building the app.');
            }
        }
        let dir;
        if (options.dir) {
            dir = options.dir;
        }
        else {
            const buildOptions = yield context.getTargetOptions((0, architect_1.targetFromTargetString)(buildTarget.name));
            if (!buildOptions.outputPath) {
                throw new Error(`Cannot read the outputPath option of the Angular project '${buildTarget.name}' in angular.json.`);
            }
            if (typeof buildOptions.outputPath === 'string') {
                dir = path_1.default.join(buildOptions.outputPath, 'browser');
            }
            else {
                const obj = buildOptions.outputPath;
                dir = path_1.default.join(obj.base, obj.browser);
            }
        }
        yield engine.run(dir, options, context.logger);
    });
}
//# sourceMappingURL=actions.js.map