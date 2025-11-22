Setup Instructions

Install Node.js, npm or yarn, and Expo CLI
Run:
npm install -g expo-cli

Create a new Expo project
npx expo init OfflineNotesApp
Choose “blank” template

Install required libraries
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-gesture-handler
expo install react-native-screens react-native-safe-area-context
expo install expo-image-picker expo-file-system

Replace the default App.js with the one from this project.

Start the project
npx expo start
Then open it in Expo Go on your phone.
