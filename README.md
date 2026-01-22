# Village App

A mobile application for village announcements, news, martyrs, and the Sheikh/Minister profile.  
The app is fully in Arabic and supports Arabic fonts.

---

## 📱 Features

- **News Page**
  - Section for **Announcements & Activities**
  - Section for **Breaking News**
- **Martyrs Page**
  - List of martyrs with photos, names, and short biographies
- **Sheikh Ragheb Hareb Page**
  - Display profile photo, name, and biography
- Full support for Arabic language and **Cairo font**
- Modern, responsive UI
- Mock Data enabled, so the app can run without a real database

---

## 🛠️ Requirements

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) installed
- Device or emulator to run the app

---

## 🚀 Running the App Locally

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2.Start the Expo server:
```bash
npx expo start
```

3.Scan the QR code to run on a physical device or use an emulator.


🗂️ Project Structure
/src
  /components      # Reusable components
  /screens         # App screens (News, Martyrs, Sheikh)
  /assets          # Images, fonts, and other assets
App.tsx            # Entry point of the app


🎨 Fonts and Colors

Main font: Cairo
Primary colors:
Dark Green: #2c5f2d
Dark Brown: #8b4513
Light Background: #f8f9fa


⚙️ Developer Notes

Currently, the app uses Mock Data instead of a real database.
Can be later connected to Firebase or any other backend.
Screens are ready for RTL layout and Arabic support.
Easily extensible for new pages or additional features.


📄 License

This project is open-source and free to modify.


