import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMembersStore } from '@/store/useMembersStore';
import { router } from 'expo-router';
import { User, ChevronRight } from 'lucide-react-native';

export default function MembersListScreen() {
  const { members, loading, fetchMembers } = useMembersStore();

  useEffect(() => {
    fetchMembers();
  }, []);

  const renderMember = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/(admin)/members/${item.id}` as any)}
    >
      <View style={styles.cardContent}>
        <View style={styles.avatar}>
          <User color="#00FF66" size={24} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.details}>{item.age} yrs • {item.weight || 'N/A'} kg</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.badge, { backgroundColor: item.hasSchedule ? '#00FF6620' : '#333' }]}>
            <Text style={[styles.badgeText, { color: item.hasSchedule ? '#00FF66' : '#888' }]}>
              {item.hasSchedule ? 'Schedule Set' : 'No Schedule'}
            </Text>
          </View>
          <ChevronRight color="#444" size={20} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00FF66" />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No approved members found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 16, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#333' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 2 },
  email: { color: '#888', fontSize: 14, marginBottom: 4 },
  details: { color: '#A0A0A0', fontSize: 13 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 16 }
});
