# Publishing Guide

This document outlines how to publish the BMLT MCP Server to npm.

## Prerequisites

1. **npm Account**: You need an npm account with publishing permissions
2. **GitHub Repository**: Code should be pushed to the GitHub repository
3. **npm Token**: Set up in GitHub repository secrets as `NPM_TOKEN`

## Setup npm Token

1. Log in to [npmjs.com](https://npmjs.com)
2. Go to Access Tokens in your profile settings
3. Create a new "Automation" token
4. Copy the token
5. In your GitHub repository, go to Settings → Secrets and variables → Actions
6. Add a new repository secret named `NPM_TOKEN` with your token value

## Publishing Process

### Automated Publishing (Recommended)

The project is set up for automated publishing via GitHub Actions:

1. **Create a Release on GitHub:**
   ```bash
   # Create and push a git tag
   git tag v1.0.0
   git push origin v1.0.0
   
   # Or create a release through GitHub web interface
   ```

2. **The GitHub Action will:**
   - Run tests on Node.js 18, 20, and 22
   - Run linting
   - Build the project
   - Test the installation
   - Publish to npm automatically
   - Attach the package tarball to the GitHub release

### Manual Publishing

If you need to publish manually:

1. **Prepare the package:**
   ```bash
   npm run lint
   npm run build
   npm test
   ```

2. **Update version:**
   ```bash
   npm version patch  # or minor/major
   ```

3. **Publish:**
   ```bash
   npm publish
   ```

4. **Push changes:**
   ```bash
   git push
   git push --tags
   ```

## Version Management

- **Patch** (1.0.x): Bug fixes, small improvements
- **Minor** (1.x.0): New features, non-breaking changes
- **Major** (x.0.0): Breaking changes

## Pre-publishing Checklist

- [ ] All tests pass
- [ ] Linting passes
- [ ] README is up to date
- [ ] Version number is appropriate
- [ ] CHANGELOG is updated (if you create one)
- [ ] All features are documented

## Package Contents

The published package includes:
- `dist/` - Compiled JavaScript
- `package.json`
- `README.md`
- `LICENSE`

Excluded from package (see `.npmignore`):
- `src/` - TypeScript source
- Development files
- Test files
- Build configuration
- Git files

## CI/CD Pipeline

The GitHub Actions workflow:

1. **On Push/PR to main:**
   - Runs tests
   - Runs linting
   - Builds project
   - Tests installation

2. **On Release:**
   - Runs full test suite
   - Builds project
   - Publishes to npm
   - Attaches package to GitHub release

3. **Security Checks:**
   - Runs `npm audit`
   - Checks for outdated dependencies

## Troubleshooting

### Publication Fails

1. Check if the version already exists on npm
2. Verify npm token is correct and has permissions
3. Check if package name is available
4. Ensure all required files are included

### Tests Fail

1. Check Node.js version compatibility
2. Verify all dependencies are listed in `package.json`
3. Ensure build artifacts exist in `dist/`

### Security Issues

1. Run `npm audit fix` for vulnerabilities
2. Update dependencies to latest secure versions
3. Review and address any security warnings

## Post-Publication

1. **Verify the package:** Visit [npmjs.com/package/bmlt-mcp-server](https://npmjs.com/package/bmlt-mcp-server)
2. **Test installation:** Try installing the published package globally
3. **Update documentation:** If needed, update any external documentation
4. **Announce:** Share the release with the community

## Useful Commands

```bash
# Check what will be published
npm pack --dry-run

# View package contents
npm pack
tar -tzf bmlt-mcp-server-*.tgz

# Test global installation locally
npm pack
npm install -g ./bmlt-mcp-server-*.tgz

# Check package info
npm info bmlt-mcp-server

# View download stats (after publication)
npm info bmlt-mcp-server --json
```
