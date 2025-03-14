/* jscs:disable */
/* eslint-disable */

var path = require('path');

/**
 * Convert the relative path imports within TypeScript into absolute paths with pre-fixed module name
 *
 * @returns {{visitor: {ImportDeclaration: visitor.ImportDeclaration}}}
 */
module.exports = function () {
    'use strict';

    return {
        visitor: {
            /**
             * Convert ../../utils/util import into Boundsoff_PageBuilderTemplateInline/js/utils/util
             *
             * @param {Object} importPath
             * @param {Object} state
             * @constructor
             */
            ImportDeclaration: function (importPath, state) {
                var importExpression = importPath.node.source.value;

                if (!state.opts.prefix) {
                    throw Error('Prefix must be defined');
                }

                // Is the file being imported from another directory?
                if (!path.isAbsolute(importExpression) && importExpression.includes('./')) {
                    importPath.node.source.value = path.resolve(
                        path.dirname(state.file.opts.filename.replace(
                            state.opts.path,
                            ""
                        )),
                        importExpression
                    ).replace(
                        process.cwd(),
                        state.opts.prefix.replace(/\/+$/, '')
                    );
                }
            }
        }
    };
};
