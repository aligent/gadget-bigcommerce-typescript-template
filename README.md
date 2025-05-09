# Aligent Gadget BigCommerce App Typescript Template

This repository was developed to help determine best practices and configuration for building BigCommerce apps with the [Gadget](https://gadget.dev/) platform.

## Changes from the standard Gadget codebase

- Aligent standard static analysis setup (tsconfig, eslint, prettier, editorconfig)
  - Some deviations:
    - tsconfig is declared inline as Gadget does not support `extends` configuration
    - `no-unused-vars` rule loosened to make working with Gadget actions easier
    - `no-console` added as Gadget provides a `logger` object
    - `.gadget.ts` files are ignored because the Gadget server has a tendency to reformat them
- `.yarn` added to `.ignore` and `.gitignore` (not strictly necessary as yarn classic doesn't create this folder)

## Development

### Philosophy

- Develop locally in an IDE
- Git repository is source of truth for code, not Gadget server
  - Exceptions to the above are `.gadget.ts` files (schemas etc.), which are easier to work with in the Gadget editor
- Sync code with a separate environment, and test in a separate app linked to that environment
- When ready to promote to development, make a pull request

### Quickstart

#### Set up editing in your local IDE

> [!IMPORTANT]
> Gadget requires **Yarn Classic**. Corepack should detect this from the `packageManager` property in `package.json`

- Open the Gadget Editor: `https://<your-app-name>.gadget.app/edit/development`
- Create a new development environment, cloning `development` ([Gadget documentation](https://docs.gadget.dev/guides/environments#adding-development-environments))
- Clone this repository and sync local files with the server:

```bash
git clone https://github.com/aligent/gadget-bigcommerce-typescript-template.git app-name
cd ./app-name
yarn gadget:link app-name environment-name
```

> [!TIP]
> If prompted about conflicts, choose these options:
>
> - Merge local and environment's changes
> - Keep local conflicting changes

> [!CAUTION]
> Outright discarding files from the Gadget environment can leave it in an unusable state. If this happens you will need to push up a working app to the environment.

#### Optional - fix linting errors

run `yarn lint --fix` in another terminal to identify (if possible) fix any linting errors in pulled down files

#### Install your environment's version of the app in BigCommerce

- Open `Settings > Plugins > BigCommerce` in the Gadget Editor with your environment selected
- Follow the instructions under `Create a single-click BigCommerce app`, taking care to:
  - Create a **new** app in the BigCommerce Developer Portal
  - Fill in **all** the callback URLs (Make sure to click `Show all URLs` in Gadget)
- Open `Apps > My Apps > My Draft Apps` in the BigCommerce Admin and install your app

> [!IMPORTANT]
> If multiple versions of an app are installed in one BigCommerce stores their processes may conflict. It's recommended to have different stores for testing each environment.

#### Add features

1. Create a feature branch from development
2. Make code changes with `ggt dev` running, test in connected environment
3. Commit changes to feature branch and PR back to `development`
4. When PR is accepted, sync `development` branch and environment on Gadget:

```bash
npx ggt push --env development
```

### Tips

Read our gadget-specific [development notes](./docs/GADGET.md).

### CI/CD

**Local development**

- `package.json` contains scripts for standard tasks - linting, testing, checking typescript compilation
- Each of these is run as a pre-commit hook.
- **Automated testing is currently stubbed**.

**Source control**

- A pipeline runs linting and testing on Pull Requests.
- **Types are not checked** because they rely on type declarations in the `.gadget` folder which we do not commit to source control.

## TODO

- Work out how to protect `development` environment (or equivalent `staging` environment) so it is only modified by PR + pipeline
- Set up automated testing
