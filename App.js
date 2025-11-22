// UPDATED: Internship-ready version of the Offline Multi-User Notes App
// Clean structure, consistent formatting, clearer naming, modular helpers
// Expo (Managed) React Native Project

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/****************************** Storage Keys ******************************/
const USERS_KEY = 'app_users_v1';
const NOTES_KEY_PREFIX = 'user_notes_';

/****************************** Storage Utils ******************************/
const loadUsers = async () => {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('loadUsers error:', err);
    return [];
  }
};

const saveUsers = (users) => AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

const loadNotes = async (username) => {
  try {
    const data = await AsyncStorage.getItem(NOTES_KEY_PREFIX + username);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('loadNotes error:', err);
    return [];
  }
};

const saveNotes = (username, notes) =>
  AsyncStorage.setItem(NOTES_KEY_PREFIX + username, JSON.stringify(notes));

const generateId = () => Math.random().toString(36).substring(2, 10);

/****************************** Auth Screens ******************************/
const LoginScreen = ({ navigation, route }) => {
  const { onLogin } = route.params;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const users = await loadUsers();
    const user = users.find((u) => u.username === username);

    if (!user) return Alert.alert('Error', 'User not found');
    if (user.password !== password) return Alert.alert('Error', 'Incorrect password');

    onLogin(username);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password or PIN"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
      <View style={{ height: 12 }} />
      <Button
        title="Create Account"
        onPress={() => navigation.navigate('SignUp', { onLogin })}
      />

      <View style={{ height: 16 }} />
      <Text style={styles.smallText}>
        Note: This is an offline demo. All data is kept locally on the device.
      </Text>
    </SafeAreaView>
  );
};

const SignUpScreen = ({ navigation, route }) => {
  const { onLogin } = route.params;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!username || !password) return Alert.alert('Error', 'Please fill in all fields');

    const users = await loadUsers();
    if (users.find((u) => u.username === username))
      return Alert.alert('Error', 'Username already exists');

    const updatedUsers = [...users, { username, password }];
    await saveUsers(updatedUsers);
    await saveNotes(username, []);

    onLogin(username);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password or PIN"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Create Account" onPress={handleSignUp} />
    </SafeAreaView>
  );
};

/****************************** Notes List ******************************/
const NotesListScreen = ({ navigation, route }) => {
  const { username, onLogout } = route.params;
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState({ field: 'updated', order: 'desc' });

  const refreshNotes = async () => {
    const userNotes = await loadNotes(username);
    setNotes(userNotes || []);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshNotes);
    // initial load
    refreshNotes();
    return unsubscribe;
  }, [navigation, username]);

  const filteredNotes = () => {
    const q = (search || '').toLowerCase();
    let filtered = (notes || []).filter((n) => {
      const t = (n.title || '').toLowerCase();
      const b = (n.body || '').toLowerCase();
      if (!q) return true;
      return t.includes(q) || b.includes(q);
    });

    filtered.sort((a, b) => {
      if (sortOption.field === 'title') {
        const A = (a.title || '').toLowerCase();
        const B = (b.title || '').toLowerCase();
        return sortOption.order === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
      }

      const A = a.updatedAt || a.createdAt || 0;
      const B = b.updatedAt || b.createdAt || 0;
      return sortOption.order === 'asc' ? A - B : B - A;
    });

    return filtered;
  };

  const cycleSort = () => {
    if (sortOption.field === 'updated' && sortOption.order === 'desc')
      return setSortOption({ field: 'updated', order: 'asc' });
    if (sortOption.field === 'updated') return setSortOption({ field: 'title', order: 'asc' });
    if (sortOption.field === 'title' && sortOption.order === 'asc')
      return setSortOption({ field: 'title', order: 'desc' });
    return setSortOption({ field: 'updated', order: 'desc' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notes — {username}</Text>
        <Button title="Logout" onPress={() => onLogout(false)} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search notes (title or body)"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.row}>
        <Button title={`Sort: ${sortOption.field} (${sortOption.order})`} onPress={cycleSort} />
        <Button title="New Note" onPress={() => navigation.navigate('EditNote', { username, noteId: null })} />
      </View>

      <FlatList
        data={filteredNotes()}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#666' }}>No notes yet. Tap "New Note" to create one.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() => navigation.navigate('EditNote', { username, noteId: item.id })}
          >
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Text style={{ color: '#999' }}>IMG</Text>
              </View>
            )}

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.noteTitle}>{item.title || '(No title)'}</Text>
              <Text numberOfLines={2} style={styles.notePreview}>
                {item.body || ''}
              </Text>
              <Text style={styles.noteDate}>
                {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={{ height: 8 }} />
      <Button title="Switch Account" onPress={() => onLogout(true)} />
    </SafeAreaView>
  );
};

/****************************** Edit Note Screen ******************************/
const EditNoteScreen = ({ navigation, route }) => {
  const { username, noteId } = route.params;
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState({
    id: generateId(),
    title: '',
    body: '',
    imageUri: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  useEffect(() => {
    (async () => {
      const userNotes = await loadNotes(username);
      setNotes(userNotes || []);

      if (noteId) {
        const n = (userNotes || []).find((x) => x.id === noteId);
        if (n) setNote(n);
      }

      // request permissions but don't block
      try {
        if (Platform.OS !== 'web') {
          await ImagePicker.requestCameraPermissionsAsync();
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
      } catch (e) {
        // ignore permissions errors here
      }
    })();
  }, [noteId, username]);

  const persistImage = async (uri) => {
    try {
      const filename = `${username}_${generateId()}.jpg`;
      const dest = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (err) {
      console.error('persistImage error', err);
      return uri;
    }
  };

  const pickFromLibrary = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
      if (res.cancelled === false || (res.assets && res.assets.length > 0)) {
        const uri = res.uri || (res.assets && res.assets[0] && res.assets[0].uri);
        const localUri = await persistImage(uri);
        setNote({ ...note, imageUri: localUri });
      }
    } catch (e) {
      console.warn('pickFromLibrary error', e);
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });
      if (res.cancelled === false || (res.assets && res.assets.length > 0)) {
        const uri = res.uri || (res.assets && res.assets[0] && res.assets[0].uri);
        const localUri = await persistImage(uri);
        setNote({ ...note, imageUri: localUri });
      }
    } catch (e) {
      console.warn('takePhoto error', e);
      Alert.alert('Error', 'Could not take photo');
    }
  };

  const saveNote = async () => {
    const updated = { ...note, updatedAt: Date.now(), createdAt: note.createdAt || Date.now() };
    // remove any existing note with same id, then add updated to top
    const rest = (notes || []).filter((n) => n.id !== updated.id);
    const newNotes = [updated, ...rest];
    await saveNotes(username, newNotes);
    navigation.goBack();
  };

  const deleteNote = async () => {
    if (!note || !note.id) {
      navigation.goBack();
      return;
    }
    Alert.alert('Delete', 'Delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const remaining = (notes || []).filter((n) => n.id !== note.id);
          await saveNotes(username, remaining);
          // attempt to remove the image file if it's in app document dir
          try {
            if (note.imageUri && note.imageUri.startsWith(FileSystem.documentDirectory)) {
              await FileSystem.deleteAsync(note.imageUri, { idempotent: true });
            }
          } catch (e) {
            // ignore delete errors
          }
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>{noteId ? 'Edit Note' : 'New Note'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={note.title}
          onChangeText={(t) => setNote({ ...note, title: t })}
        />

        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="Body"
          value={note.body}
          onChangeText={(t) => setNote({ ...note, body: t })}
          multiline
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
          <Button title="Pick from Gallery" onPress={pickFromLibrary} />
          <Button title="Take Photo" onPress={takePhoto} />
        </View>

        {note.imageUri ? (
          <Image source={{ uri: note.imageUri }} style={{ width: '100%', height: 240, borderRadius: 8, marginBottom: 12 }} />
        ) : null}

        <Button title="Save" onPress={saveNote} />
        <View style={{ height: 8 }} />
        {noteId ? <Button title="Delete" color="red" onPress={deleteNote} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

/****************************** App Root ******************************/
const Stack = createNativeStackNavigator();

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // small init if needed
    (async () => {
      // we could pre-load users here if desired
      setInitializing(false);
    })();
  }, []);

  const handleLogin = (username) => {
    setLoggedInUser(username);
  };

  const handleLogout = (switchAccount = false) => {
    // if switchAccount true, show login so user can pick another
    setLoggedInUser(null);
  };

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!loggedInUser ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              initialParams={{ onLogin: handleLogin }}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              initialParams={{ onLogin: handleLogin }}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="NotesList"
              component={NotesListScreen}
              initialParams={{ username: loggedInUser, onLogout: handleLogout }}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditNote"
              component={EditNoteScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/****************************** Styles ******************************/
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  smallText: { fontSize: 12, color: '#666' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  noteCard: {
    flexDirection: 'row',
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  thumb: { width: 64, height: 64, borderRadius: 6 },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteTitle: { fontWeight: '700', fontSize: 16 },
  notePreview: { color: '#333', marginTop: 4 },
  noteDate: { fontSize: 11, color: '#666', marginTop: 6 },
});
