import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, useColorScheme, RefreshControl
} from 'react-native';
import { patientsAPI } from '../api';

export default function PatientsScreen() {
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  const c      = dark ? darkColors : lightColors;

  const [patients, setPatients]   = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]   = useState(null);

  const load = useCallback(async (q = '') => {
    try {
      const { data } = await patientsAPI.getAll(q);
      setPatients(data.results || data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 400);
    return () => clearTimeout(timer);
  }, [search, load]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[s.card, { backgroundColor: c.card }]} onPress={() => setSelected(selected?.id === item.id ? null : item)} activeOpacity={0.85}>
      <View style={s.cardRow}>
        <View style={[s.avatar, { backgroundColor: c.avatarBg }]}>
          <Text style={[s.avatarText, { color: c.primary }]}>
            {item.full_name?.[0] ?? '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.name, { color: c.text }]}>{item.full_name}</Text>
          <Text style={[s.sub, { color: c.subText }]}>
            {item.gender === 'M' ? 'نێر' : 'مێ'} · تەمەن {item.age} · {item.phone}
          </Text>
        </View>
        {item.blood_type ? (
          <View style={[s.bloodBadge, { backgroundColor: c.badgeBg }]}>
            <Text style={[s.bloodText, { color: c.primary }]}>{item.blood_type}</Text>
          </View>
        ) : null}
      </View>

      {/* تەفسیلی زیاتر */}
      {selected?.id === item.id && (
        <View style={[s.detail, { borderTopColor: c.border }]}>
          {item.allergies ? (
            <DetailRow icon="⚠️" label="هەستیاری" value={item.allergies} c={c} />
          ) : null}
          {item.medical_history ? (
            <DetailRow icon="📋" label="مێژووی نەخۆشی" value={item.medical_history} c={c} />
          ) : null}
          {item.emergency_contact_phone ? (
            <DetailRow icon="🚨" label="پەیوەندی بەپەلە" value={item.emergency_contact_phone} c={c} />
          ) : null}
          {!item.allergies && !item.medical_history && !item.emergency_contact_phone && (
            <Text style={{ color: c.subText, fontSize: 12 }}>هیچ تەفسیلێک تۆمارنەکراوە</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[s.screen, { backgroundColor: c.bg }]}>
      <Text style={[s.title, { color: c.text }]}>نەخۆشەکان</Text>

      <View style={[s.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text>🔍</Text>
        <TextInput
          style={[s.searchInput, { color: c.text }]}
          placeholder="گەڕان بە ناو یان تەلەفۆن..."
          placeholderTextColor={c.subText}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: c.subText }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading
        ? <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} size="large" />
        : (
          <FlatList
            data={patients}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(search); }} />}
            ListEmptyComponent={<Text style={[s.empty, { color: c.subText }]}>هیچ نەخۆشێک نەدۆزرایەوە</Text>}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )
      }
    </View>
  );
}

function DetailRow({ icon, label, value, c }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={{ fontSize: 11, color: c.subText, marginBottom: 2 }}>{icon} {label}</Text>
      <Text style={{ fontSize: 13, color: c.text }}>{value}</Text>
    </View>
  );
}

const lightColors = {
  bg: '#f0f4f8', card: '#fff', text: '#1a1a2e', subText: '#888',
  primary: '#534AB7', border: '#e2e8f0', avatarBg: '#EEEDFE', badgeBg: '#EEEDFE',
};
const darkColors = {
  bg: '#0f0f1a', card: '#1e1e2e', text: '#e8e8f0', subText: '#888',
  primary: '#9B8FFF', border: '#2e2e3e', avatarBg: '#2a2a3e', badgeBg: '#2a2a3e',
};

const s = StyleSheet.create({
  screen:      { flex: 1, padding: 16 },
  title:       { fontSize: 20, fontWeight: '700', marginBottom: 14, textAlign: 'right' },
  searchBox:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14 },
  card:        { borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  cardRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:      { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 18, fontWeight: '700' },
  name:        { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  sub:         { fontSize: 12, marginTop: 2, textAlign: 'right' },
  bloodBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bloodText:   { fontSize: 12, fontWeight: '600' },
  detail:      { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  empty:       { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
