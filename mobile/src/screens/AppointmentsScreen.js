import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, useColorScheme, RefreshControl, Alert
} from 'react-native';
import { appointmentsAPI } from '../api';

const STATUS = {
  waiting:   { label: 'چاوەڕوان', bg: '#fef3c7', color: '#92400e', next: 'active',  nextLabel: 'چالاک بکە' },
  active:    { label: 'چالاک',    bg: '#d1fae5', color: '#065f46', next: 'done',    nextLabel: 'تەواو بکە' },
  done:      { label: 'تەواو',    bg: '#f1f5f9', color: '#475569', next: null,       nextLabel: null },
  cancelled: { label: 'هەڵوەشاوە', bg: '#fee2e2', color: '#991b1b', next: null,      nextLabel: null },
};

export default function AppointmentsScreen() {
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  const bg     = dark ? '#0f0f1a' : '#f0f4f8';
  const card   = dark ? '#1e1e2e' : '#fff';
  const text   = dark ? '#e8e8f0' : '#1a1a2e';
  const sub    = '#888';
  const border = dark ? '#2e2e3e' : '#e2e8f0';

  const [appts, setAppts]         = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]       = useState('all');

  const load = async () => {
    try {
      const f = filter !== 'all' ? { status: filter } : {};
      const { data } = await appointmentsAPI.getAll(f);
      setAppts(data.results || data);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    await appointmentsAPI.update(id, { status });
    load();
  };

  const renderItem = ({ item }) => {
    const st = STATUS[item.status] ?? STATUS.waiting;
    return (
      <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: text }]}>{item.patient_name}</Text>
            <Text style={[s.doc,  { color: sub  }]}>{item.doctor_name}</Text>
            <Text style={[s.time, { color: sub  }]}>📅 {item.date} ⏰ {item.time?.slice(0,5)}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: st.bg }]}>
            <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
        {item.notes ? <Text style={[s.notes, { color: sub, borderColor: border }]}>{item.notes}</Text> : null}
        {st.next && (
          <TouchableOpacity style={[s.btn, { backgroundColor: STATUS[st.next].bg }]}
            onPress={() => Alert.alert('دڵنیابوونەوە', `دەتەوێت بارودۆخ بگۆڕیت؟`, [
              { text: 'نەخێر', style: 'cancel' },
              { text: 'بەڵێ', onPress: () => updateStatus(item.id, st.next) },
            ])}>
            <Text style={[s.btnText, { color: STATUS[st.next].color }]}>{st.nextLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filters = [
    { key: 'all',      label: 'هەموو' },
    { key: 'waiting',  label: 'چاوەڕوان' },
    { key: 'active',   label: 'چالاک' },
    { key: 'done',     label: 'تەواو' },
  ];

  return (
    <View style={[s.screen, { backgroundColor: bg }]}>
      {/* فیلتەرەکان */}
      <View style={s.filters}>
        {filters.map(f => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)}
            style={[s.filterBtn, { backgroundColor: filter === f.key ? '#534AB7' : card, borderColor: border }]}>
            <Text style={{ color: filter === f.key ? '#fff' : sub, fontSize: 12 }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={appts}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<Text style={[s.empty, { color: sub }]}>هیچ کاتژمێرێک نەدۆزرایەوە</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen:    { flex: 1, padding: 16 },
  filters:   { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  card:      { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  row:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name:      { fontSize: 15, fontWeight: '600', textAlign: 'right' },
  doc:       { fontSize: 12, marginTop: 2, textAlign: 'right' },
  time:      { fontSize: 12, marginTop: 4, textAlign: 'right' },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  notes:     { marginTop: 10, paddingTop: 10, borderTopWidth: 1, fontSize: 12 },
  btn:       { marginTop: 10, padding: 8, borderRadius: 8, alignItems: 'center' },
  btnText:   { fontSize: 13, fontWeight: '500' },
  empty:     { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
