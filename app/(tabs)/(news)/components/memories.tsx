import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Video, ResizeMode } from 'expo-av';
import { db } from '@/lib/firebase';

const { width, height } = Dimensions.get('window');

interface Memory {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  memoryDate: string;
}

export default function Memories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state moved to top-level
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);

  const openMedia = (uri: string, type: 'image' | 'video') => {
    setSelectedMedia({ uri, type });
    setModalVisible(true);
  };

  // Fetch memories
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'memories'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const data: Memory[] = snapshot.docs.map(doc => {
          const raw = doc.data() as any;
          return {
            id: doc.id,
            title: raw.title,
            description: raw.description,
            content: raw.content,
            images: raw.images || [],
            videos: raw.videos || [],
            memoryDate: raw.memoryDate?.toDate
              ? raw.memoryDate.toDate().toLocaleDateString('ar-EG')
              : '',
          };
        });

        setMemories(data);
      } catch (e) {
        console.error('Error fetching memories', e);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);

  // Render each memory
  const renderItem = ({ item }: { item: Memory }) => {
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.memoryDate}</Text>
        </View>

        {/* Images */}
        {item.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ marginVertical: 10 }}
          >
            {item.images.map((img, index) => (
              <TouchableOpacity key={`img-${index}`} onPress={() => openMedia(img, 'image')}>
                <Image source={{ uri: img }} style={styles.mediaHorizontal} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Videos */}
        {item.videos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ marginVertical: 10 }}
          >
            {item.videos.map((vid, index) => (
              <TouchableOpacity key={`vid-${index}`} onPress={() => openMedia(vid, 'video')}>
                <Video
                  source={{ uri: vid }}
                  style={styles.mediaHorizontal}
                  resizeMode={ResizeMode.COVER} // thumbnail mode
                  shouldPlay={false} // don't autoplay
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.text}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={memories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        nestedScrollEnabled={true}
      />

      {/* Fullscreen Modal */}
      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={{ fontSize: 28, color: '#fff' }}>×</Text>
          </TouchableOpacity>

          {selectedMedia?.type === 'image' && (
            <Image source={{ uri: selectedMedia.uri }} style={styles.fullscreenMedia} resizeMode="contain" />
          )}

          {selectedMedia?.type === 'video' && (
            <Video
              source={{ uri: selectedMedia.uri }}
              style={styles.fullscreenMedia}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={true}
              shouldPlay={true}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontFamily: 'Cairo-Bold', fontSize: 16, color: '#333' },
  date: { fontFamily: 'Cairo-Regular', fontSize: 12, color: '#999' },
  mediaHorizontal: { width: 120, height: 120, borderRadius: 12, marginRight: 10 },
  content: { marginTop: 8 },
  description: { fontFamily: 'Cairo-Bold', fontSize: 14, color: '#555', marginBottom: 4 },
  text: { fontFamily: 'Cairo-Regular', fontSize: 13, color: '#666' },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenMedia: {
    width: width,
    height: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
});
