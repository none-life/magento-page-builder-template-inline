const tsDirectory = 'view/adminhtml/web/ts/';
const moduleName = 'Boundsoff_PageBuilderTemplateInline';

module.exports = {
    passPerPreset: true,
    presets: [
        {
            plugins: [
                ['@babel/plugin-proposal-class-properties', {
                    loose: true
                }],
                '@babel/plugin-transform-modules-amd',
                './babel/plugin-amd-to-magento-amd',
            ]
        },
        [
            '@babel/preset-env',
            {
                loose: true,
                targets: {
                    browsers: ['last 2 versions']
                },
                modules: 'amd'
            }
        ]
    ],
    plugins: [
        '@babel/plugin-transform-typescript',
        ['./babel/plugin-resolve-magento-imports', {
            path: tsDirectory,
            prefix: moduleName
        }],
        ['@comandeer/babel-plugin-banner', {
            'banner': "/*eslint-disable */\n/* jscs:disable */",
        }],
        '@babel/plugin-syntax-object-rest-spread'
    ],
    ignore: [
        '/**/*.d.ts',
        '/**/*.types.ts',
    ]
};
