# node-librhsp

This project enables Node.js applications to control devices that speak the REV Hub Serial Protocol (such as the REV Robotics Expansion Hub).

## Package structure

This project uses [lerna](https://lerna.js.org) for
multi-package builds.

We have several packages currently:

1. `librhsp`: Raw interaction with librhsp.
2. `expansion-hub`: High-level interaction with a REV expansion hub.
3. `sample`: Command line app useful for testing and showing features.

## Building and other tasks

To build the app, run `npx lerna run build`.
If you have other tasks you wish to create, define
them in the module's package.json like normal, and run
`npx lerna run mytask`. This will run 'mytask' in every
module that has a task with that name.

Tasks in the top-level package.json can be run with
`npm run` like normal.

## Making a release

1. Check out the `main` branch.
2. Run `npm install` from the repository's root directory.
3. If you've made any changes to the structure of the project, run `npm pack` in each package directory, and validate
   that the packaged `.tgz` files contain everything that will be needed to use the library, but nothing more.
   1. `README.md` files will always be included.
   2. Make any necessary changes to the `files` property of the incorrect package's `package.json` file.
4. Run `lerna publish`. This command will do the following:
   1. Bump the versions of any packages that have changed since the last git tag, asking which version number should
      get bumped for each one
   2. Commit the version bumps and any `package-json.lock` changes
   3. Create a git tag for each package that is being published, and push it to GitHub
5. If `lerna publish` failed, see https://lerna.js.org/docs/faq#how-do-i-retry-publishing-if-publish-fails. Make sure
   to remove any `gitHead` fields in `package.json` files.
6. Go to https://github.com/REVrobotics/node-rhsplib/tags, select each new tag, and create a new release for each one.
   1. Name the release `<package name> version <version>`
   2. Write up a description of the changes to that specific package.
