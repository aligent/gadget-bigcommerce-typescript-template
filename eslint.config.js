const { eslintConfigs } = require('@aligent/ts-code-standards');

module.exports = [...eslintConfigs.react,
{
    ignores: ['**/*.gadget.ts', '.gadget', '**/*.js'],
},
{
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_|params|record|logger|api|connections', ignoreRestSiblings: true,  },
        ],
        'no-console': 'error'
    }
}
];
