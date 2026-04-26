import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
    setLoading(true);
    try {
      const { data } = await authAPI.login(username, password);
      await AsyncStorage.setItem('access_token', data.access);
      await AsyncStorage.setItem('refresh_token', data.refresh);
      onLogin();
    } catch {
      Alert.alert('هەڵە', 'ناوی بەکارهێنەر یان پاسوۆرد هەڵەیە');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.container}>
      <View style={s.card}>
        <Text style={s.emoji}>🏥</Text>
        <Text style={s.title}>سیستەمی کلینیک</Text>
        <Text style={s.sub}>تکایە زانیارییەکانت داخڵ بکە</Text>

        <TextInput style={s.input} placeholder="ناوی بەکارهێنەر" value={username}
          onChangeText={setUsername} autoCapitalize="none" textAlign="right" />
        <TextInput style={s.input} placeholder="پاسوۆرد" value={password}
          onChangeText={setPassword} secureTextEntry textAlign="right" />

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>چوونەژوورەوە</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center' },
  card:      { backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '88%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  emoji:     { fontSize: 48, marginBottom: 8 },
  title:     { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  sub:       { fontSize: 13, color: '#888', marginBottom: 24 },
  input:     { width: '100%', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 12, color: '#1a1a2e' },
  btn:       { width: '100%', backgroundColor: '#534AB7', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  btnText:   { color: '#fff', fontSize: 15, fontWeight: '600' },
});
