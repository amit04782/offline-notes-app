Offline Notes App

This is a small offline notes app I made using React Native and Expo. It supports multiple users on the same device, and each user can create, edit, and delete their own notes. Everything is stored locally and works offline.

Setup Instructions:

1. Install Node.js, npm or yarn, and Expo CLI.
   To install Expo CLI:
   npm install -g expo-cli

2. Create a new Expo project:
   npx expo init OfflineNotesApp
   Choose the blank template.

3. Install the required libraries:
   npm install @react-native-async-storage/async-storage
   npm install @react-navigation/native @react-navigation/native-stack
   npm install react-native-gesture-handler
   expo install react-native-screens react-native-safe-area-context
   expo install expo-image-picker expo-file-system

4. Replace the default App.js with the file from this project.

5. Run the project:
   npx expo start
   Then open it in Expo Go on your phone.

Libraries Used:

* AsyncStorage: stores users and notes offline.
* expo-image-picker: pick images or take photos.
* expo-file-system: saves images so they stay after restart.
* React Navigation: handles screen navigation.
* gesture-handler, screens, safe-area-context: required for navigation.

Known Issues / Things to Improve:

* Passwords are stored in plain text.
* Notes and images are not encrypted.
* UI is simple and basic.
* No cloud backup feature.
* Notes cannot be manually reordered.
