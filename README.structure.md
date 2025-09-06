# Project Documentation: The Hash Slinging Slasher's Senior-Project: Church-Tithes-App

## Overview

This project is a **React Native** mobile application that enables church members to pay tithes digitally to their church of choice. It features a church directory, digital payments, and a user-friendly interface for contactless tithing.

---

## Root Directory: File and Folder Descriptions

### Files

- [`README.md`](README.md:1): Project overview, setup instructions, prerequisites, and support resources.
- [`package.json`](package.json:1): Node.js project manifest. Defines dependencies, scripts, and Node version requirements.
- [`package-lock.json`](package-lock.json): Auto-generated lockfile for npm, ensuring consistent dependency installs.
- [`App.tsx`](App.tsx:1): Main React Native application component. Sets up safe area context, status bar, and renders the main app screen.
- [`index.js`](index.js:1): Entry point for the React Native app. Registers the main App component.
- [`app.json`](app.json): App configuration for React Native (app name, display name, etc.).
- [`Makefile`](Makefile:1): Automation for common development tasks (setup, clean, build, run on emulator/device, etc.).
- [`LICENSE`](LICENSE): Project license (Apache License 2.0).
- [`babel.config.js`](babel.config.js): Babel configuration for JavaScript/TypeScript transpilation.
- [`tsconfig.json`](tsconfig.json): TypeScript configuration (compiler options, paths, etc.).
- [`jest.config.js`](jest.config.js): Configuration for Jest testing framework.
- [`Gemfile`](Gemfile): Ruby gem dependencies (may be used for auxiliary tooling or CI).
- [`metro.config.js`](metro.config.js): Metro bundler configuration for React Native.
- [`.eslintrc.js`](.eslintrc.js): ESLint configuration for code linting.
- [`.prettierrc.js`](.prettierrc.js): Prettier configuration for code formatting.
- [`.watchmanconfig`](.watchmanconfig): Configuration for Watchman (file watching utility).
- [`.gitignore`](.gitignore): Specifies files and directories to be ignored by Git.

### Folders

- [`android/`](android/): Native Android project files. Contains Gradle build scripts, Java/Kotlin source, and Android resources. Used for building and running the app on Android devices/emulators.
- [`ios/`](ios/): Native iOS project files. Contains Xcode project, Swift/Objective-C source, and iOS resources. Used for building and running the app on iOS devices/simulators.
- [`__tests__/`](__tests__): Contains test files for the app (e.g., [`App.test.tsx`](__tests__/App.test.tsx)).
- [`.github/`](.github/): GitHub-specific files, such as workflows for CI/CD (e.g., linting).
- [`.bundle/`](.bundle/): Typically used for bundler or dependency management metadata (may be empty or used by tooling).

---

## Folder Purposes

- **android/**: All files required to build, run, and package the app for Android. Includes Gradle scripts, native code, and resources.
- **ios/**: All files required to build, run, and package the app for iOS. Includes Xcode project, native code, and resources.
- **__tests__/**: Automated tests for the app, typically run with Jest.
- **.github/**: GitHub Actions workflows and repository configuration.
- **.bundle/**: Tooling metadata (may be used by dependency managers or build tools).

---

## Development Workflow

### Prerequisites

- **Node.js** (>=18)
- **npm** (Node package manager)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, on macOS)
- **Git** (for version control)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Seclusion-5150/The-Hash-Slinging-Slasher-s-Senior-Project-Church-Tithes-App.git
   cd The-Hash-Slinging-Slasher-s-Senior-Project-Church-Tithes-App
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **(Optional) Use Makefile for setup:**
   ```sh
   make setup
   ```

### Running the App

- **Start Metro Bundler:**
  ```sh
  npm start
  ```
  or
  ```sh
  make metro
  ```

- **Run on Android emulator:**
  ```sh
  npm run android
  ```
  or
  ```sh
  make android
  ```

- **Run on iOS simulator (macOS only):**
  ```sh
  make ios
  ```

- **Run tests:**
  ```sh
  npm test
  ```

- **Lint code:**
  ```sh
  npm run lint
  ```

- **Clean build artifacts and caches:**
  ```sh
  make clean
  ```
  or for a deep clean:
  ```sh
  make nuke
  ```

### Notes

- The Makefile provides convenient shortcuts for common tasks, including emulator management and deep cleaning.
- The project uses ESLint and Prettier for code quality and formatting.
- TypeScript is supported via `tsconfig.json`.
- Jest is used for testing.

---

## How to Develop in This Framework

1. **Edit the main app logic in [`App.tsx`](App.tsx:1).** This is the root React component.
2. **Add new components, screens, or utilities as needed.** Organize them in new folders if the project grows.
3. **Use the Makefile or npm scripts to build, run, test, and lint your code.**
4. **For native code changes (Android/iOS), edit files in the respective `android/` or `ios/` folders.**
5. **Write and run tests in the `__tests__/` folder.**
6. **Follow code style enforced by ESLint and Prettier.**
7. **Commit changes with clear messages and push to your GitHub repository.**

---

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/environment-setup)
- [Metro Bundler](https://facebook.github.io/metro/)
- [Jest Testing](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

---

This documentation provides a comprehensive overview of the project structure, file/folder purposes, and development workflow for the Church Tithes App React Native project.