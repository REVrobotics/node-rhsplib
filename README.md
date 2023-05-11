# node-rhsplib

This project enables Node.js applications to control devices that speak the REV Hub Serial Protocol (such as the REV Robotics Expansion Hub).

## package structure

This project uses [lerna](https://lerna.js.org) for
multi-package builds.

We have several packages currently:

1. rhsplib: Raw interaction with RHSPLib.
1. expansion-hub: High-level interaction with a REV expansion hub.
1. sample: Command line app useful for testing and showing features.

## building and other tasks

To build the app, run `lerna run build`.
If you have other tasks you wish to create, define 
them in the package.json like normal, and run 
`lerna run mytask`

## Making a release

1. Check out the `main` branch
2. Update `version` field in `package.json`
3. Run `lerna run build`
4. Commit package.json and package-lock.json to git
5. Run `git tag v<version>`
6. Run `git push`
7. Run `git push --tags`
8. Run `npm publish --access public`
9. Create a new release on GitHub with an explanation of the changes
