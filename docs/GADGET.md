# Gadget x BigCommerce Notes

> [!NOTE]
> The app is deployed in Gadget's serverless function platform powered by Google Cloud Platform. Data is stored securely and scalably in a hosted PostgresSQL database, you are provided with a built-in React frontend powered by `Vite`.

## Connection between stores and apps

Installations are tracked in the `bigcommerce/store` or `shopify/shop` tables.

Make sure you set up an `uninstall` callback for your app so that the app correctly cleans up data in these tables when it is uninstalled from a `backend`.

Gadget handles `/load` and `/auth` endpoints under the hood, populating the `session` and `connections` apis with data specific to the store, user, and `backend`.

## Package management

Gadget builds and references important packages locally in your project using `"link:.gadget/client"` and `"link:.gadget/server"`

The Gadget server must be able to install dependencies based on `package.json`/`yarn.lock`. This process can be manually repeated by opening `package.json` in the web console and clicking `Run yarn` at the bottom.

- If it errors with a message about `yarn install --check-files`, make sure you're using **Yarn Version 1**
  - The `packageManager` field in `package.json` should specify something starting with `yarn@1…`

Gadget allows running some terminal commands with `CTRL` + `P`, but not `npm` commands currently.

## Environments

The url for an environment is `https://<your-app>--<your-environment>.gadget.app/` note that there's two dashes in the middle.

> [!IMPORTANT]
> Gadget environments deploy immediately and do not have a way to revert changes. It is strongly recommended to do experiments and feature development in a new environment for this reason.

## Local development

`ggt dev` will clone an environment's codebase to your local machine, but it also initialises a fresh git repository. When working with an existing repo it's better to clone the repo and then use `ggt dev` to sync it with the environment.

`ggt dev` automatically synchronises local files with server files, which can cause a local file to be constantly overwritten if the server is changing it. Sometimes manually executing `ggt pull` and `ggt push` will be preferable.

## Typescript

Gadget supports almost all compiler options but not other `tsconfig` options - notably `extends` is not currently supported.

## Actions

Gadget Dev Docs -> https://docs.gadget.dev/guides/actions#actions

Actions are equivalent to serverless functions. There are two kinds, Global and Model Actions:

- **Global actions** are best suited when you are interacting with more than one model or with an external system, they wont be passed any `record` object.
- **Model actions** run within one model and will often use the `record` object, they are best for creating, updating, or deleting a specific record in the database.

Actions have two functions that run automatically, first is the `run` function, this is main function, then the `onSuccess` function will run assuming the `run` function is successful.

> [!IMPORTANT]
> Actions will only run for 180 seconds before timing out, tasks that take longer will need to use Background Actions. These are Actions that can be enqueued to run, and will do so at some point. https://docs.gadget.dev/guides/actions/background

## GGT

GGT is Gadget's CLI tool: https://docs.gadget.dev/reference/ggt

`ggt push --env env-name` - After finishing up developing in your own Gadget environment, you will need to push changes to the main development environment before that environment gets deployed to production.

