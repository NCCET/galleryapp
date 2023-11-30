import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Camera, CameraType, FileSystem } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhoto, setEditedPhoto] = useState(null);
  const [cameraSettings, setCameraSettings] = useState({
    exposure: 0,
    whiteBalance: 'auto',
    focus: 'on',
    resolution: 'high',
    aspectRatio: '16:9',
  });

  const handleEditPhoto = () => {
    setIsEditing(true);
    // Implement image editing functionalities (cropping, filters, etc.)
    // Update edited photo state with the edited image
  };

  const applyCameraSettings = () => {
    // Apply camera settings based on user preferences
    // Adjust exposure, white balance, focus, resolution, and aspect ratio
  };


  useEffect(() => {
    return () => {
      if (photoUri) {
        FileSystem.deleteAsync(photoUri, { idempotent: true });
      }
    };
  }, [photoUri]);

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const takePhoto = async () => {
    setIsProcessing(true);
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1.0, skipProcessing: false, fixOrientation: true });
        setPhotoUri(photo.uri);
      } catch (error) {
        console.error('Error taking photo:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const savePhoto = async () => {
    if (photoUri) {
      const asset = await FileSystem.getInfoAsync(photoUri);
      const newUri = `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`;

      await FileSystem.moveAsync({
        from: asset.uri,
        to: newUri,
      });

      setPhotoUri(null);
      alert('Photo saved!');
    }
  };

  const deletePhoto = async () => {
    if (photoUri) {
      await FileSystem.deleteAsync(photoUri, { idempotent: true });
      setPhotoUri(null);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <MaterialIcons name={type === CameraType.back ? 'camera-front' : 'camera-rear'} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="camera" size={24} color="white" />
            )}
          </TouchableOpacity>
          {photoUri && (
            <>
              <TouchableOpacity style={styles.button} onPress={savePhoto}>
                <MaterialIcons name="save" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={deletePhoto}>
                <MaterialIcons name="delete" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
        {photoUri && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>Last Taken Photo</Text>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          </View>
        )}
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
    justifyContent: 'space-around',
  },
  button: {
    alignItems: 'center',
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 18,
  },
  permissionButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    margin: 20,
  },
  previewContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
