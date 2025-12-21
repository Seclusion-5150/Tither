# Tither - Church Tithe Mobile App

A modern mobile application that simplifies the process of giving tithes to churches. This platform enables church members to conveniently send tithes anytime, anywhere, while providing churches with an efficient digital collection system.

[![TypeScript](https://img.shields.io/badge/TypeScript-98.1%25-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)](https://expo.dev/)
[![Contributors](https://img.shields.io/github/contributors/Seclusion-5150/Tither)](https://github.com/Seclusion-5150/Tither/graphs/contributors)

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

### 🙏 For Church Members
- **Flexible Tithe Payments**: Send tithes anytime, anywhere without physically being at church
- **Multiple Church Support**: Manage and send tithes to multiple churches from a single account
- **Secure Payment Processing**: Safe and encrypted payment transactions
- **Payment History**: Track all your tithe contributions in one place

### ⛪ For Churches
- **Simplified Collection**: Automated digital tithe collection system
- **Tracking**: Monitor incoming tithes
- **Member Management**: View and manage registered church members
- **Financial Reports**: Generate comprehensive financial reports
- **Reduced Administrative Burden**: Less manual handling of physical cash and checks

### 🔍 Church Directory
- **Browse Churches**: Discover churches in your area
- **Search & Filter**: Find churches by denomination, location, or other criteria
- **Church Profiles**: Detailed information about each church including service times, contact info, and mission statement

## Screenshots

> Add screenshots of your app here

## Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Supabase (Database & Authentication)
- **Payment Processing**: Stripe
- **Navigation**: Expo Router (file-based routing)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.x or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** (comes with Node.js) or **yarn**
  - Verify npm: `npm --version`
  - Or install yarn: `npm install -g yarn`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

- **Expo Go App** (for testing on physical devices)
  - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

- **Supabase Account**
  - Sign up at [supabase.com](https://supabase.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Seclusion-5150/Tither.git
cd Tither
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

## Configuration

### 1. Environment Setup

Create a `.env` file in the root directory of the project:

```bash
cp .env.example .env
```

Or create it manually and add the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

### 2. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/)
2. Navigate to Project Settings > API
3. Copy your project URL and anon key
4. Update the `.env` file with these credentials

### 3. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com/)
2. Navigate to Developers > API keys
3. Copy your publishable and secret keys (use test keys for development)
4. Add them to your `.env` file

## Running the Application

### Start the Development Server

```bash
npm start
# or
npx expo start
```

This will start the Expo development server and display a QR code in your terminal.

### Run on Physical Device

1. Install **Expo Go** app on your iOS or Android device (if not already installed)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code displayed in your terminal using:
   - iOS: Camera app
   - Android: Expo Go app

The app will load and run on your device. Any changes you make to the code will be reflected automatically.

## Database Setup

### Running Migrations

The project uses Supabase for database management. To set up your database:

1. **Link your Supabase project**:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

2. **Run migrations**:
   ```bash
   npx supabase db push
   ```

3. **Seed the database** (if seed file exists):
   ```bash
   npx supabase db seed
   ```

### Database Schema

The application uses the following main tables:

- `users` - User account information
- `churches` - Church profiles and information
- `tithes` - Tithe transaction records
- `payment_methods` - Saved payment methods
- `schedules` - Scheduled tithe payments

For detailed schema information, check the `supabase/migrations/` directory.

## Troubleshooting

### Common Issues

#### Issue: "Metro bundler not starting"

**Solution**:
```bash
# Clear cache and restart
npx expo start -c
```

#### Issue: "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Issue: "Supabase connection error"

**Solution**:
- Verify your `.env` file has correct credentials
- Check if Supabase project is active
- Ensure network connectivity

#### Issue: "Stripe payment processing fails"

**Solution**:
- Verify Stripe credentials in `.env`
- Ensure you're using test keys for development
- Check Stripe dashboard for errors
- Confirm test mode is enabled in your Stripe account

#### Issue: "App won't load on Expo Go"

**Solution**:
- Ensure your phone and computer are on the same network
- Try restarting the Expo development server
- Check that Expo Go app is up to date

## Team

- **Yeshua Colon** - [@Seclusion-5150](https://github.com/Seclusion-5150)
- **Tyler Shook** - [@Tylershook1](https://github.com/Tylershook1)
- **Guillermo MC** - [@mcguillermo](https://github.com/mcguillermo)
- **Edward Arzoumanov** - [@EdwardGrasshopper](https://github.com/EdwardGrasshopper)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
