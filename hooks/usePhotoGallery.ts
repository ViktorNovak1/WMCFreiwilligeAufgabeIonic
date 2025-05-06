import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export interface UserPhoto {
    uri: string;
    filepath: string;    // fuers filesystem
    filename: string;
}

export function usePhotoGallery() {
    const [photos, setPhotos] = useState<UserPhoto[]>([]);

    useEffect(() => {
        loadSavedPhotos();
    }, []);

    const takePhoto = async () => {
        console.log("opening camera...");
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            alert("Zugriff auf Kamera wurde denied");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            const fileName = Date.now().toString() + '.jpg';
            const newPath = FileSystem.documentDirectory + fileName;

            try {
                console.log("Foto gespeichert:", newPath);
                await FileSystem.copyAsync({ from: uri, to: newPath });

                const base64 = await FileSystem.readAsStringAsync(newPath, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const savedPhoto: UserPhoto = {
                    uri: `data:image/jpeg;base64,${base64}`,
                    filepath: newPath,
                    filename: fileName,
                };

                const newPhotos = [savedPhoto, ...photos];
                setPhotos(newPhotos);
                await savePhotos(newPhotos);

                console.log("Foto gespeichert:", savedPhoto);
            } catch (err) {
                console.error("Fehler beim speichern:", err);
            }
        } else {
            console.log("Foto wurde abgebrochen");
        }
    };

    const savePhotos = async (photos: UserPhoto[]) => {
        const json = JSON.stringify(photos);
        await FileSystem.writeAsStringAsync(
            FileSystem.documentDirectory + 'photos.json',
            json
        );
        console.log("Fotos gespeichert:", json);
    };

    const loadSavedPhotos = async () => {
        const path = FileSystem.documentDirectory + 'photos.json';
        const fileInfo = await FileSystem.getInfoAsync(path);

        if (!fileInfo.exists) {
            console.log("Keine Fotos gefunden");
            return;
        }

        try {
            const content = await FileSystem.readAsStringAsync(path);
            const parsed = JSON.parse(content) as UserPhoto[];

            const existingPhotos: UserPhoto[] = [];

            for (const photo of parsed) {
                if (!photo.filepath) {
                    console.warn("invalid filepath:", photo);
                    continue;
                }

                const fileCheck = await FileSystem.getInfoAsync(photo.filepath);
                if (fileCheck.exists) {
                    const base64 = await FileSystem.readAsStringAsync(photo.filepath, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    existingPhotos.push({
                        uri: `data:image/jpeg;base64,${base64}`,
                        filepath: photo.filepath,
                        filename: photo.filename,
                    });
                } else {
                    console.warn("Datei fehlt:", photo.filepath);
                }
            }

            setPhotos(existingPhotos);
            console.log("Fotos geladen:", existingPhotos);
        } catch (err) {
            console.error("Fehler beim laden der Fotos:", err);
        }
    };

    const deletePhoto = async (photo: UserPhoto) => {
        try {
            await FileSystem.deleteAsync(photo.filepath);
            const updated = photos.filter((p) => p.filename !== photo.filename);
            setPhotos(updated);
            await savePhotos(updated);
            console.log("Foto geloescht:", photo);
        } catch (err) {
            console.error("Fehler beim Loeschen:", err);
        }
    };

    const resetGallery = async () => {
        try {
            for (const photo of photos) {
                if (photo.filepath) {
                    await FileSystem.deleteAsync(photo.filepath, { idempotent: true });
                }
            }

            await FileSystem.deleteAsync(FileSystem.documentDirectory + 'photos.json', {
                idempotent: true,
            });

            setPhotos([]);
            console.log("Galerie geloescht");
        } catch (err) {
            console.error("Fehler beim loeschen Galerie:", err);
        }
    };

    return { photos, takePhoto, deletePhoto, resetGallery };
}
