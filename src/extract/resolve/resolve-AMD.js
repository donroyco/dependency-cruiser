"use strict";

const path                     = require('path');
const resolve                  = require('resolve');
const fs                       = require('fs');
const _                        = require('lodash');
const determineDependencyTypes = require('./determineDependencyTypes');
const readPackageDeps          = require('./readPackageDeps');

const fileExists = _.memoize(pFile => {
    try {
        fs.accessSync(pFile, fs.R_OK);
    } catch (e) {
        return false;
    }

    return true;
});

module.exports = (pModuleName, pBaseDir, pFileDir) => {
    // lookups:
    // - [x] could be relative in the end (implemented)
    // - [ ] require.config kerfuffle (command line, html, file, ...)
    // - [ ] maybe use mrjoelkemp/module-lookup-amd ?
    // - [ ] or https://github.com/jaredhanson/amd-resolve ?
    // - [x] funky plugins (json!wappie, ./screeching-cat!sabertooth) -> fixed in 'extract'
    const lProbablePath = path.relative(
        pBaseDir,
        path.join(pFileDir, `${pModuleName}.js`)
    );
    const lDependency = {
        resolved: fileExists(lProbablePath) ? lProbablePath : pModuleName,
        coreModule: Boolean(resolve.isCore(pModuleName)),
        followable: fileExists(lProbablePath),
        couldNotResolve: !Boolean(resolve.isCore(pModuleName)) && !fileExists(lProbablePath)
    };

    return Object.assign(
        lDependency,
        {
            dependencyTypes: determineDependencyTypes(
                lDependency,
                pModuleName,
                readPackageDeps(pBaseDir),
                pFileDir
            )
        }
    );
};
