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
  name: "الشيخ راغب حرب",
  photo_url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Falmaaref.org.lb%2Fpost%2F11079%2F%25D8%25B4%25D9%258A%25D8%25AE-%25D8%25B4%25D9%2587%25D8%25AF%25D8%25A7%25D8%25A1-%25D8%25A7%25D9%2584%25D9%2585%25D9%2582%25D8%25A7%25D9%2588%25D9%2585%25D8%25A9-%25D8%25A7%25D9%2584%25D8%25B4%25D9%258A%25D8%25AE-%25D8%25B1%25D8%25A7%25D8%25BA%25D8%25A8-%25D8%25AD%25D8%25B1%25D8%25A8&psig=AOvVaw0XCS7aMeK7qEo_E1b9_Spk&ust=1769348293661000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLjCgpampJIDFQAAAAAdAAAAABAE", // add URL if available
  biography:
    "من قادة المقاومة في لبنان"
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
