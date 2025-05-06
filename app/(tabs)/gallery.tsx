import { View, FlatList, Image, Pressable, Alert, Button } from 'react-native';
import { usePhotoGallery, UserPhoto } from '../../hooks/usePhotoGallery';

export default function GalleryTab() {
    const { photos, takePhoto, deletePhoto, resetGallery } = usePhotoGallery();

    const confirmDelete = (photo: UserPhoto) => {
        Alert.alert(
            'Foto loeschen?',
            'Willst du dieses Foto wirklich loeschen?',
            [
                { text: 'Abbrechen', style: 'cancel' },
                {
                    text: 'Loeschen',
                    style: 'destructive',
                    onPress: () => deletePhoto(photo),
                },
            ]
        );
    };

    const confirmReset = () => {
        Alert.alert(
            'Galerie loeschen',
            'Willst du wirklich alle Fotos loeschen?',
            [
                { text: 'Abbrechen', style: 'cancel' },
                {
                    text: 'Loeschen',
                    style: 'destructive',
                    onPress: resetGallery,
                },
            ]
        );
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <FlatList
                numColumns={2}
                data={photos}
                keyExtractor={(item) => item.filename}
                renderItem={({ item }) => (
                    <Pressable onLongPress={() => confirmDelete(item)}>
                        <Image
                            source={{ uri: item.uri }}
                            style={{ width: 180, height: 180, margin: 5, borderRadius: 10 }}
                        />
                    </Pressable>
                )}
            />
            <Button title="Foto aufnehmen" onPress={takePhoto} />
            <View style={{ height: 10 }} />
            <Button title="Alle Fotos loeschen" onPress={confirmReset} color="#cc0000" />
        </View>
    );
}
