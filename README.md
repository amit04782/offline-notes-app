# Offline Notes App — README

This is a simple offline notes app I built using React Native and Expo. I wrote this README in a clear and straightforward way so someone reviewing my project can easily run it and understand how it works.

---

## Setup Instructions

These are the steps to run the project from scratch.

### 1. Install Requirements

* Node.js
* npm or yarn
* Expo CLI

If you don't have Expo CLI:

```
npm install -g expo-cli
```

### 2. Create a New Expo Project

```
npx expo init OfflineNotesApp
```

Choose the **blank** template.

### 3. Install Needed Libraries

```
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-gesture-handler
expo install react-native-screens react-native-safe-area-context
expo install expo-image-picker expo-file-system
```

### 4. Add the App Code

Replace the default `App.js` with the one included in this project.

### 5. Run the App

```
npx expo start
```

Open it in **Expo Go** on your phone.

---

## Libraries Used

These are the main libraries and what I used them for.

### AsyncStorage

Used to save users and notes offline.

### expo-image-picker

Used for taking photos or choosing images from the gallery.

### expo-file-system

Used to save images so they stay even after the app restarts.

### React Navigation

Used for switching between screens (Login, Notes List, Create/Edit Note).

### gesture-handler / screens / safe-area-context

Required for navigation to work properly.

---

##

---

## Known Issues / Things I Could Improve

I'm aware of these limitations and could fix them later.

1. Passwords are not hashed (stored as plain text).
2. Notes and images are not encrypted.
3. UI is basic and not very styled.
4. No cloud backup or export feature.
5. Notes cannot be manually reordered.

---

##

