import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, useColorScheme, RefreshControl, Alert
} from 'react-native';
import { paymentsAPI } from '../api';

const STATUS = {
  paid:     { label: 'پارەدراوە', bg: '#d1fae5', color: '#065f46' },
  pending:  { label: 'چاوەڕوان',  bg: '#fef3c7', color: '#92400e' },
  refunded: { label: 'گەڕاوەتەوە', bg: '#fee2e2', color: '#991b1b' },
};
const METHODS = { cash: 'کاش', card: 'کارت', online: 'ئۆنلاین' };

export default function PaymentsScreen() {
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  const bg   = dark ? '#0f0f1a' : '#f0f4f8';
  const card = dark ? '#1e1e2e' : '#fff';
  const text = dark ? '#e8e8f0' : '#1a1a2e';
  const sub  = '#888';
  const border = dark ? '#2e2e3e' : '#e2e8f0';

  const [payments, setPayments]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [p, s] = await Promise.all([paymentsAPI.getAll(), paymentsAPI.getStats()]);
      setPayments(p.data.results || p.data);
      setStats(s.data);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id) => {
    Alert.alert('پارەدان', 'دڵنیای؟', [
      { text: 'نەخێر', style: 'cancel' },
      { text: 'بەڵێ', onPress: async () => { await paymentsAPI.markPaid(id); load(); } },
    ]);
  };

  const renderItem = ({ item }) => {
    const st = STATUS[item.status] ?? STATUS.pending;
    return (
      <View style={[s.card, { backgroundColor: card, borderColor: border }]}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: text }]}>{item.patient_name}</Text>
            <Text style={[s.inv, { color: '#534AB7' }]}>{item.invoice_no}</Text>
            <Text style={[s.met, { color: sub }]}>{METHODS[item.method]} · {item.created_at?.slice(0,10)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text style={[s.amount, { color: text }]}>${item.amount}</Text>
            <View style={[s.badge, { backgroundColor: st.bg }]}>
              <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
        </View>
        {item.status === 'pending' && (
          <TouchableOpacity style={s.payBtn} onPress={() => markPaid(item.id)}>
            <Text style={s.payBtnText}>✓ پارەدان تۆماربکە</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: bg }]}>
      {stats && (
        <View style={s.statsRow}>
          {[
            { l: 'ئەمڕۆ', v: `$${stats.today_revenue?.toFixed(0) ?? 0}`, c: '#059669' },
            { l: 'کۆی داهات', v: `$${stats.total_revenue?.toFixed(0) ?? 0}`, c: '#534AB7' },
            { l: 'چاوەڕوان', v: stats.pending_count, c: '#d97706' },
          ].map(s2 => (
            <View key={s2.l} style={[s.statCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={{ fontSize: 11, color: sub, textAlign: 'center' }}>{s2.l}</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: s2.c, textAlign: 'center' }}>{s2.v}</Text>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={payments}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<Text style={[s.empty, { color: sub }]}>هیچ پارەدانێک نییە</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen:    { flex: 1, padding: 16 },
  statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard:  { flex: 1, borderRadius: 10, padding: 10, borderWidth: 1 },
  card:      { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  row:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name:      { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  inv:       { fontSize: 12, marginTop: 2, textAlign: 'right' },
  met:       { fontSize: 11, marginTop: 2, textAlign: 'right' },
  amount:    { fontSize: 18, fontWeight: '700', textAlign: 'right' },
  badge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  payBtn:    { marginTop: 10, backgroundColor: '#d1fae5', padding: 8, borderRadius: 8, alignItems: 'center' },
  payBtnText:{ color: '#065f46', fontSize: 13, fontWeight: '600' },
  empty:     { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
