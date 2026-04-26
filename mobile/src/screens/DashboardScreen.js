import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { appointmentsAPI, patientsAPI, paymentsAPI } from '../api';

function StatCard({ label, value, color, icon }) {
  return (
    <View style={[s.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={s.cardIcon}>{icon}</Text>
      <Text style={[s.cardValue, { color }]}>{value}</Text>
      <Text style={s.cardLabel}>{label}</Text>
    </View>
  );
}

function ApptRow({ item, onStatusChange }) {
  const STATUS = { waiting: ['چاوەڕوان', '#92400e', '#fef3c7'], active: ['چالاک', '#065f46', '#d1fae5'], done: ['تەواو', '#475569', '#f1f5f9'] };
  const [st, bg] = STATUS[item.status] ?? ['—', '#888', '#f1f5f9'];
  return (
    <View style={s.apptRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.apptName}>{item.patient_name}</Text>
        <Text style={s.apptDoctor}>{item.doctor_name} · {item.time?.slice(0,5)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <View style={[s.badge, { backgroundColor: bg }]}>
          <Text style={[s.badgeText, { color: st[1] }]}>{st}</Text>
        </View>
        {item.status === 'waiting' && (
          <TouchableOpacity style={s.actionBtn} onPress={() => onStatusChange(item.id, 'active')}>
            <Text style={s.actionBtnText}>چالاک بکە</Text>
          </TouchableOpacity>
        )}
        {item.status === 'active' && (
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#e0e7ff' }]} onPress={() => onStatusChange(item.id, 'done')}>
            <Text style={[s.actionBtnText, { color: '#3730a3' }]}>تەواو بکە</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [apptStats, setApptStats]   = useState(null);
  const [patStats, setPatStats]     = useState(null);
  const [payStats, setPayStats]     = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [a, p, pay, today] = await Promise.all([
        appointmentsAPI.getStats(),
        patientsAPI.getStats(),
        paymentsAPI.getStats(),
        appointmentsAPI.getToday(),
      ]);
      setApptStats(a.data);
      setPatStats(p.data);
      setPayStats(pay.data);
      setTodayAppts(today.data.results || today.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const updateStatus = async (id, status) => {
    await appointmentsAPI.update(id, { status });
    load();
  };

  return (
    <ScrollView style={s.screen} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={s.pageTitle}>داشبۆردی ئەمڕۆ</Text>

      <View style={s.statsGrid}>
        <StatCard label="کاتژمێری ئەمڕۆ"  value={apptStats?.today_total ?? '—'} color="#534AB7" icon="📅" />
        <StatCard label="چاوەڕوان"          value={apptStats?.today_waiting ?? '—'} color="#d97706" icon="⏳" />
        <StatCard label="کۆی نەخۆشەکان"    value={patStats?.total ?? '—'} color="#0891b2" icon="🧑" />
        <StatCard label="داهاتی ئەمڕۆ"     value={`$${payStats?.today_revenue?.toFixed(0) ?? 0}`} color="#059669" icon="💵" />
      </View>

      <Text style={s.sectionTitle}>کاتژمێرەکانی ئەمڕۆ</Text>
      {todayAppts.length === 0
        ? <Text style={s.empty}>هیچ کاتژمێرێک نییە ئەمڕۆ</Text>
        : todayAppts.map(a => <ApptRow key={a.id} item={a} onStatusChange={updateStatus} />)
      }
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  pageTitle:    { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 16, textAlign: 'right' },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 14, width: '47%', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardIcon:     { fontSize: 22, marginBottom: 4, textAlign: 'right' },
  cardValue:    { fontSize: 26, fontWeight: '700', textAlign: 'right' },
  cardLabel:    { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'right' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#555', marginBottom: 10, textAlign: 'right' },
  apptRow:      { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, elevation: 1 },
  apptName:     { fontSize: 14, fontWeight: '600', color: '#1a1a2e', textAlign: 'right' },
  apptDoctor:   { fontSize: 12, color: '#888', marginTop: 2, textAlign: 'right' },
  badge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '500' },
  actionBtn:    { backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  actionBtnText:{ fontSize: 11, color: '#065f46', fontWeight: '500' },
  empty:        { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 14 },
});
