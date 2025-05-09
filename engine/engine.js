"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.run = run;
exports.prepareOptions = prepareOptions;
const fse = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const defaults_1 = require("./defaults");
const git_1 = __importDefault(require("gh-pages/lib/git"));
function run(dir, options, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        options = yield prepareOptions(options, logger);
        const ghpages = require('gh-pages');
        if (options.dryRun) {
            logger.info('Dry-run / SKIPPED: cleaning of the cache directory');
        }
        else {
            ghpages.clean();
        }
        yield checkIfDistFolderExists(dir);
        yield createNotFoundFile(dir, options, logger);
        yield createCnameFile(dir, options, logger);
        yield createNojekyllFile(dir, options, logger);
        yield publishViaGhPages(ghpages, dir, options, logger);
        if (!options.dryRun) {
            logger.info('🌟 Successfully published via angular-cli-ghpages! Have a nice day!');
        }
    });
}
function prepareOptions(origOptions, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = Object.assign(Object.assign({}, defaults_1.defaults), origOptions);
        const util = require('util');
        let debuglog = util.debuglog;
        util.debuglog = set => {
            if (set === 'gh-pages') {
                return function () {
                    let message = util.format.apply(util, arguments);
                    logger.info(message);
                };
            }
            return debuglog(set);
        };
        if (origOptions.noDotfiles) {
            options.dotfiles = !origOptions.noDotfiles;
        }
        if (origOptions.noNotfound) {
            options.notfound = !origOptions.noNotfound;
        }
        if (origOptions.noNojekyll) {
            options.nojekyll = !origOptions.noNojekyll;
        }
        if (options.dryRun) {
            logger.info('Dry-run: No changes are applied at all.');
        }
        if (options.name && options.email) {
            options['user'] = {
                name: options.name,
                email: options.email
            };
        }
        if (process.env.TRAVIS) {
            options.message +=
                ' -- ' +
                    process.env.TRAVIS_COMMIT_MESSAGE +
                    ' \n\n' +
                    'Triggered by commit: https://github.com/' +
                    process.env.TRAVIS_REPO_SLUG +
                    '/commit/' +
                    process.env.TRAVIS_COMMIT +
                    '\n' +
                    'Travis CI build: https://travis-ci.org/' +
                    process.env.TRAVIS_REPO_SLUG +
                    '/builds/' +
                    process.env.TRAVIS_BUILD_ID;
        }
        if (process.env.CIRCLECI) {
            options.message +=
                '\n\n' +
                    'Triggered by commit: https://github.com/' +
                    process.env.CIRCLE_PROJECT_USERNAME +
                    '/' +
                    process.env.CIRCLE_PROJECT_REPONAME +
                    '/commit/' +
                    process.env.CIRCLE_SHA1 +
                    '\n' +
                    'CircleCI build: ' +
                    process.env.CIRCLE_BUILD_URL;
        }
        if (process.env.GITHUB_ACTIONS) {
            options.message +=
                '\n\n' +
                    'Triggered by commit: https://github.com/' +
                    process.env.GITHUB_REPOSITORY +
                    '/commit/' +
                    process.env.GITHUB_SHA;
        }
        if (!options.repo) {
            options.repo = yield getRemoteUrl(options);
        }
        if (process.env.GH_TOKEN &&
            options.repo &&
            options.repo.includes('GH_TOKEN')) {
            options.repo = options.repo.replace('GH_TOKEN', process.env.GH_TOKEN);
        }
        else if (options.repo && !options.repo.includes('x-access-token:')) {
            if (process.env.GH_TOKEN) {
                options.repo = options.repo.replace('https://github.com/', `https://x-access-token:${process.env.GH_TOKEN}@github.com/`);
            }
            if (process.env.PERSONAL_TOKEN) {
                options.repo = options.repo.replace('https://github.com/', `https://x-access-token:${process.env.PERSONAL_TOKEN}@github.com/`);
            }
            if (process.env.GITHUB_TOKEN) {
                options.repo = options.repo.replace('https://github.com/', `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/`);
            }
        }
        return options;
    });
}
function checkIfDistFolderExists(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield !fse.pathExists(dir)) {
            throw new Error('Dist folder does not exist. Check the dir --dir parameter or build the project first!');
        }
    });
}
function createNotFoundFile(dir, options, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.notfound) {
            return;
        }
        if (options.dryRun) {
            logger.info('Dry-run / SKIPPED: copying of index.html to 404.html');
            return;
        }
        const indexHtml = path.join(dir, 'index.html');
        const notFoundFile = path.join(dir, '404.html');
        try {
            yield fse.copy(indexHtml, notFoundFile);
            logger.info('404.html file created');
        }
        catch (err) {
            logger.info('index.html could not be copied to 404.html. Proceeding without it.');
            logger.debug('Diagnostic info: ' + err.message);
            return;
        }
    });
}
function createCnameFile(dir, options, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.cname) {
            return;
        }
        const cnameFile = path.join(dir, 'CNAME');
        if (options.dryRun) {
            logger.info('Dry-run / SKIPPED: creating of CNAME file with content: ' + options.cname);
            return;
        }
        try {
            yield fse.writeFile(cnameFile, options.cname);
            logger.info('CNAME file created');
        }
        catch (err) {
            throw new Error('CNAME file could not be created. ' + err.message);
        }
    });
}
function createNojekyllFile(dir, options, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.nojekyll) {
            return;
        }
        const nojekyllFile = path.join(dir, '.nojekyll');
        if (options.dryRun) {
            logger.info('Dry-run / SKIPPED: creating a .nojekyll file');
            return;
        }
        try {
            yield fse.writeFile(nojekyllFile, '');
            logger.info('.nojekyll file created');
        }
        catch (err) {
            throw new Error('.nojekyll file could not be created. ' + err.message);
        }
    });
}
function publishViaGhPages(ghPages, dir, options, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.dryRun) {
            logger.info(`Dry-run / SKIPPED: publishing folder '${dir}' with the following options: ` +
                JSON.stringify({
                    dir,
                    repo: options.repo || 'current working directory (which must be a git repo in this case) will be used to commit & push',
                    remote: options.remote,
                    message: options.message,
                    branch: options.branch,
                    name: options.name ? `the name '${options.username} will be used for the commit` : 'local or global git user name will be used for the commit',
                    email: options.email ? `the email '${options.cname} will be used for the commit` : 'local or global git user email will be used for the commit',
                    dotfiles: options.dotfiles ? `files starting with dot ('.') will be included` : `files starting with dot ('.') will be ignored`,
                    notfound: options.notfound ? 'a 404.html file will be created' : 'a 404.html file will NOT be created',
                    nojekyll: options.nojekyll ? 'a .nojekyll file will be created' : 'a .nojekyll file will NOT be created',
                    cname: options.cname ? `a CNAME file with the content '${options.cname}' will be created` : 'a CNAME file will NOT be created',
                    add: options.add ? 'all files will be added to the branch. Existing files will not be removed' : 'existing files will be removed from the branch before adding the new ones',
                }, null, '  '));
            return;
        }
        logger.info('🚀 Uploading via git, please wait...');
        return new Promise((resolve, reject) => {
            ghPages.publish(dir, options, error => {
                if (error) {
                    return reject(error);
                }
                resolve(undefined);
            });
        });
    });
}
function getRemoteUrl(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const git = new git_1.default(process.cwd(), options.git);
        return yield git.getRemoteUrl(options.remote);
    });
}
//# sourceMappingURL=engine.js.map