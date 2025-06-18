# Sehetna App - Translation System

This document describes the Arabic/English translation system implemented in the Sehetna App.

## Overview

The app now supports both English and Arabic languages using the `react-i18next` library. Users can switch between languages using the language toggle in the sidebar.

## Features

- **Bilingual Support**: Full English and Arabic translations
- **RTL Support**: Automatic right-to-left layout for Arabic
- **Language Persistence**: Language preference is saved in localStorage
- **Dynamic Translation**: All text content is translatable
- **Sidebar Language Toggle**: Easy language switching from the sidebar

## Implementation Details

### 1. Translation Files

- `src/locales/en.json` - English translations
- `src/locales/ar.json` - Arabic translations

### 2. Configuration

- `src/i18n.js` - i18n configuration
- `src/contexts/LanguageContext.jsx` - Language state management

### 3. Components Updated

- `src/App.jsx` - Added LanguageProvider
- `src/components/Sidebar.jsx` - Added language toggle and translations
- `src/components/Login.jsx` - Added translations for login form
- `src/components/Home.jsx` - Added translations for dashboard
- `src/components/Users.jsx` - Added translations for users management
- `src/App.css` - Added RTL support styles

## Usage

### Using Translations in Components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### Language Switching

```jsx
import { useLanguage } from '../contexts/LanguageContext';

function LanguageToggle() {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  return (
    <button onClick={() => changeLanguage('ar')}>
      العربية
    </button>
  );
}
```

## Translation Structure

The translation files are organized into sections:

- `sidebar` - Sidebar navigation items
- `login` - Login form and authentication
- `common` - Common UI elements (buttons, labels, etc.)
- `dashboard` - Dashboard overview
- `users` - User management
- `services` - Service management
- `categories` - Category management
- `providers` - Provider management
- `documents` - Document management
- `complaints` - Complaint management
- `requests` - Request management
- `campaigns` - Campaign management
- `admins` - Admin management

## RTL Support

The app automatically switches to RTL layout when Arabic is selected:

- Document direction changes to `rtl`
- Text alignment adjusts
- Form inputs align to the right
- Navigation elements reverse order
- Icons and buttons adjust positioning

## Adding New Translations

1. Add the English translation to `src/locales/en.json`
2. Add the Arabic translation to `src/locales/ar.json`
3. Use the translation key in your component with `t('key.path')`

## Browser Support

- Modern browsers with ES6 support
- Automatic language detection based on browser settings
- Fallback to English if translation is missing

## Performance

- Translations are loaded on demand
- Language preference is cached in localStorage
- Minimal bundle size impact
- Efficient re-rendering when language changes 