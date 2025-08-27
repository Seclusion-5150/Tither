This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# The Hash Slinging Slasher's Senior-Project: Church-Tithes-App
A mobile app that makes it easy for church members to pay their tithes to a church of their choice. Similar to the Booksy app, this app allows users to find a church near them and pay their tithes digitally at their convenience from the palm of their hand. Contactless tithing. Can't make it to church this week? Users can send tithes anytime and anywhere without needing to physically be at church to give their tithe. This makes the process easier for the church member as well as the church itself in regards to collection of the funds. Users can send tithes in advance. Users can send tithes to multiple churches. The app has components of a directory which allows users to browse churches, read reviews, find their preferred church and make their next tithe.
# Programming Languages
- Python
- Javascript
- Java
# Software Packages and Frameworks
- React Native
# Church Tithes App - React Native Setup Guide

A comprehensive guide to set up the development environment for the Church Tithes mobile application.

## Prerequisites

Before getting started, ensure you have administrative access on your computer to install software and modify environment variables.

## Installation Steps

### 1. Install Node.js
Download and install Node.js from the [official Node.js website](https://nodejs.org/). Choose the LTS (Long Term Support) version for stability.

### 2. Install Android Studio
Download and install [Android Studio](https://developer.android.com/studio) following the standard installation process. This provides access to the Android SDK and device emulator necessary for React Native development.

### 3. Locate Android SDK Path
After installation, open Android Studio and navigate to settings to find the Android SDK installation directory. The typical location is:
`%USERPROFILE%\AppData\Local\Android\Sdk`

Note this path as you'll need it for environment variable configuration.

### 4. Locate Java SDK Path
Find your Java SDK installation directory. The default location is typically:
`C:\Program Files\Java\jdk-<insert-version-number-here>`

### 5. Configure Environment Variables
Add the following environment variables to your system:

**System Variables:**
- `ANDROID_HOME`: Set to your Android SDK absolute path
- `JAVA_HOME`: Set to your Java SDK absolute path

**Path Variable Additions:**
Add these directories to your system PATH:
- `%ANDROID_HOME%\platform-tools`
- `%ANDROID_HOME%\emulator`

### 6. Create and Initialize Project
Navigate to your desired project directory and run:
`npx react-native@latest init ChurchTithesApp`
`cd ChurchTithesApp`

### 7. Install Dependencies
Install the required React Native dependencies:
`npm install --save-dev @react-native-community/cli@latest`
`npm install`

### 8. Run the Application
Start the Metro bundler:
`npm start`

In a separate terminal window, launch the Android emulator and install the app:
`npm run android`

## Important Notes

- **First Build Time**: The initial build may take 10-30 minutes as it downloads and configures native dependencies
- **Troubleshooting**: If you encounter path-related errors, verify that all environment variables are correctly set and restart your terminal

## Project Structure

Once successfully set up, your project will be ready for development with all necessary React Native dependencies configured.

## Support

For additional setup assistance or troubleshooting, refer to the [React Native documentation](https://reactnative.dev/docs/environment-setup) or create an issue in this repository.

---

**Note**: This setup guide is specifically tailored for Windows development environments. Mac and Linux users should refer to the official React Native documentation for platform-specific instructions.
