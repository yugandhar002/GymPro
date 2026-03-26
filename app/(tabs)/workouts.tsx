import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useFitnessStore, WorkoutType } from '@/store/useFitnessStore';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Plus, X } from 'lucide-react-native';

export default function WorkoutsScreen() {
  const { user } = useAuthStore();
  const { workouts, addWorkout } = useFitnessStore();
  const isOwner = user?.role === 'admin';

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<WorkoutType>('Gym');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  const handleAddWorkout = () => {
    addWorkout({
      title: newTitle,
      type: newType,
      videoUrl: newVideoUrl,
      instructions: newInstructions
    });
    setModalVisible(false);
    setNewTitle('');
    setNewVideoUrl('');
    setNewInstructions('');
  };

  const extractVideoId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?]*)/);
    return match ? match[1] : null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Library</Text>
        {isOwner && (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Plus color="#000" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {workouts.map(w => {
          const videoId = extractVideoId(w.videoUrl);
          return (
            <View key={w.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{w.title}</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{w.type}</Text></View>
              </View>
              
              {videoId ? (
                <View style={styles.videoContainer}>
                  <YoutubePlayer height={200} play={false} videoId={videoId} />
                </View>
              ) : (
                <View style={styles.placeholderVideo}>
                  <Text style={styles.placeholderText}>No Video Available</Text>
                </View>
              )}

              <Text style={styles.instructions}>{w.instructions}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Admin Add Workout Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <X color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Workout</Text>
          
          <TextInput style={styles.input} placeholder="Workout Title" placeholderTextColor="#888" value={newTitle} onChangeText={setNewTitle} />
          <TextInput style={styles.input} placeholder="YouTube URL" placeholderTextColor="#888" value={newVideoUrl} onChangeText={setNewVideoUrl} />
          <TextInput style={[styles.input, { height: 100 }]} placeholder="Instructions" placeholderTextColor="#888" value={newInstructions} onChangeText={setNewInstructions} multiline />

          <TouchableOpacity style={styles.submitButton} onPress={handleAddWorkout}>
            <Text style={styles.submitButtonText}>Create Workout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, paddingTop: 48, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  addButton: { backgroundColor: '#00FF66', padding: 8, borderRadius: 12 },
  
  card: { backgroundColor: '#1E1E1E', borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  badge: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#00FF66', fontWeight: 'bold', fontSize: 12 },
  
  videoContainer: { width: '100%', height: 200, backgroundColor: '#000' },
  placeholderVideo: { width: '100%', height: 200, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#888', fontStyle: 'italic' },
  instructions: { padding: 16, color: '#A0A0A0', fontSize: 15, lineHeight: 22 },

  modalContainer: { flex: 1, backgroundColor: '#1A1A1A', padding: 24, paddingTop: 64 },
  closeButton: { alignSelf: 'flex-end', marginBottom: 16 },
  modalTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 32 },
  input: { backgroundColor: '#2C2C2C', padding: 16, borderRadius: 12, color: '#fff', fontSize: 16, marginBottom: 16 },
  submitButton: { backgroundColor: '#00FF66', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
