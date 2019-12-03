# Jaeger VSCode Extension Release Process

1. Update the version in package.json and package-lock.json
```
npm version minor
git push origin master --tag
```
(or major if a major release)

2. Build the vsix file
```
npm install
vsce package
```

3. Create a release for the tag, and upload the vsix file as asset attached to the release.
