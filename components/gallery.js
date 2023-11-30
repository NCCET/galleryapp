import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, FlatList, TouchableOpacity, ActivityIndicator, Modal, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { ImageManipulator } from 'expo-image-manipulator';
import { ImageEditor } from 'react-native';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPhotos();
  }, []);

  async function getPhotos() {
    try {
      const directory = `${FileSystem.documentDirectory}photos/`;
      const photosList = await FileSystem.readDirectoryAsync(directory);
      setPhotos(photosList.map(photo => ({ uri: directory + photo, name: photo })));
    } catch (error) {
      console.error('Error reading photos', error);
    } finally {
      setIsLoading(false);
    }
  }

  const openImage = uri => {
    setSelectedImage(uri);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const handleRotate = async () => {
    if (selectedImage) {
      const manipResult = await ImageManipulator.manipulateAsync(selectedImage, [{ rotate: 90 }]);
      setSelectedImage(manipResult.uri);
    }
  };

  const handleCrop = async () => {
    if (selectedImage) {
      const manipResult = await ImageManipulator.manipulateAsync(selectedImage, [{ crop: { originX: 0, originY: 0, width: 200, height: 200 } }]);
      setSelectedImage(manipResult.uri);
    }
  };

  const applyColorFilter = async () => {
    if (selectedImage) {
      const img = await FileSystem.readAsStringAsync(selectedImage, { encoding: FileSystem.EncodingType.Base64 });
      const result = await ImageEditor.brightnessContrastAsync(img, 0.5, 1.2);
      FileSystem.writeAsStringAsync(selectedImage, result, { encoding: FileSystem.EncodingType.Base64 });
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />
      ) : photos.length === 0 ? (
        <Text style={styles.emptyGalleryText}>No photos available</Text>
      ) : (
        <FlatList
          data={photos}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openImage(item.uri)}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
        />
      )}
      <Modal visible={selectedImage} transparent={true} onRequestClose={closeImage}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closeImage}>
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity style={styles.editButton} onPress={handleRotate}>
              <Text style={styles.editButtonText}>Rotate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={handleCrop}>
              <Text style={styles.editButtonText}>Crop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={applyColorFilter}>
              <Text style={styles.editButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyGalleryText: {
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 50,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  editButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  editButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
