# node-rhsplib

This project enables Node.js applications to control devices that speak the REV Hub Serial Protocol (such as the REV Robotics Expansion Hub).

## Package structure

This project uses [lerna](https://lerna.js.org) for
multi-package builds.

We have several packages currently:

1. `rhsplib`: Raw interaction with RHSPLib.
2. `expansion-hub`: High-level interaction with a REV expansion hub.
3. `sample`: Command line app useful for testing and showing features.

## Building and other tasks

To build the app, run `lerna run build`.
If you have other tasks you wish to create, define
them in the module's package.json like normal, and run
`lerna run mytask`. This will run 'mytask' in every
module that has a task with that name.

Tasks in the top-level package.json can be run with
`npm run` like normal.

## Making a release (update when we learn more about lerna)

1. Check out the `main` branch
2. Update `version` field in `package.json`
3. Run `npm install`
4. Commit package.json and package-lock.json to git
5. Run `git tag v<version>`
6. Run `git push`
7. Run `git push --tags`
8. Run `npm publish --access public`
9. Create a new release on GitHub with an explanation of the changes
