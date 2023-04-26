# node-rhsplib

This package enables Node.js applications to control devices that speak the REV Hub Serial Protocol (such as the REV Robotics Expansion Hub).

## Making a release

1. Check out the `main` branch
2. Update `version` field in `package.json`
3. Run `npm install`
4. Commit change to git
5. Run `git tag v<version>`
6. Run `git push`
7. Run `git push --tags`
8. Run `npm publish --access public`
9. Create a new release on GitHub with an explanation of the changes
