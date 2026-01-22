import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useEffect, useState } from 'react';

interface SheikhProfile {
  id: string;
  name: string;
  photo_url: string | null;
  biography: string;
}

// 🔹 Local mock data
const MOCK_SHEIKH_PROFILE: SheikhProfile = {
  id: '1',
  name: 'الشيخ محمد صالح',
  photo_url: null, // add URL if available
  biography:
    'الشيخ محمد صالح معروف بخدمته للقرية ومساهماته في تعليم الشباب ونشر العلم والدين.',
};

export default function SheikhTab() {
  const [profile, setProfile] = useState<SheikhProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setProfile(MOCK_SHEIKH_PROFILE);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b4513" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>لا توجد معلومات متاحة</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          {profile.photo_url ? (
            <Image source={{ uri: profile.photo_url }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>صورة الشيخ</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>السيرة الذاتية</Text>
        <Text style={styles.biography}>{profile.biography}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoContainer: {
    marginBottom: 20,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef5e7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#8b4513',
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#8b4513',
    textAlign: 'center',
  },
  name: {
    fontSize: 26,
    fontFamily: 'Cairo-Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#8b4513',
    borderRadius: 2,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: '#8b4513',
    textAlign: 'center',
    marginBottom: 16,
  },
  biography: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#333',
    lineHeight: 28,
    textAlign: 'right',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
