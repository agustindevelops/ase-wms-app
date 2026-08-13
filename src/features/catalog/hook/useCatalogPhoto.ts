import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { apiErrorMessage } from '@/api/client';
import {
  deleteImageUpload,
  putSignedUpload,
  signImageUpload,
  verifyImageUpload,
} from '@/api/img';

type ContentType = 'image/jpeg' | 'image/png' | 'image/webp';

export type CatalogPhotoEntry = {
  fileId: string;
  previewUri: string;
};

function mimeFromUri(uri: string, fallback: string | undefined): ContentType {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png') || fallback === 'image/png') return 'image/png';
  if (lower.endsWith('.webp') || fallback === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.85,
  allowsEditing: true,
};

async function uploadAsset(asset: ImagePicker.ImagePickerAsset): Promise<{
  fileId: string;
  previewUri: string;
}> {
  const contentType = mimeFromUri(asset.uri, asset.mimeType);
  const response = await fetch(asset.uri);
  const bytes = await response.arrayBuffer();
  const byteSize = bytes.byteLength;

  const signed = await signImageUpload({
    content_type: contentType,
    byte_size: byteSize,
  });

  await putSignedUpload({
    uploadUrl: signed.upload_url,
    contentType,
    bytes,
  });

  const verified = await verifyImageUpload(signed.file_id);
  if (verified.file.status !== 'uploaded') {
    throw new Error('Photo upload was not verified.');
  }

  return { fileId: verified.file.id, previewUri: asset.uri };
}

export function useCatalogPhoto() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<CatalogPhotoEntry[]>([]);

  const runWithAsset = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    setBusy(true);
    setError(null);
    setStatus('Uploading cropped photo…');

    try {
      setStatus('Signing upload…');
      const result = await uploadAsset(asset);
      setPhotos((current) => [
        ...current,
        { fileId: result.fileId, previewUri: result.previewUri },
      ]);
      setStatus('Photo saved. Add another or continue.');
    } catch (cause) {
      setError(apiErrorMessage(cause));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera permission denied.');
      return;
    }

    const picked = await ImagePicker.launchCameraAsync(pickerOptions);
    if (picked.canceled || !picked.assets[0]) {
      return;
    }

    await runWithAsset(picked.assets[0]);
  }, [runWithAsset]);

  const pickPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Media library permission denied.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (picked.canceled || !picked.assets[0]) {
      return;
    }

    await runWithAsset(picked.assets[0]);
  }, [runWithAsset]);

  const removePhoto = useCallback(async (fileId: string) => {
    setBusy(true);
    setError(null);
    setStatus('Removing photo…');
    try {
      await deleteImageUpload(fileId);
      setPhotos((current) => current.filter((photo) => photo.fileId !== fileId));
      setStatus('Photo removed.');
    } catch (cause) {
      // Still drop locally if the server already deleted it.
      setPhotos((current) => current.filter((photo) => photo.fileId !== fileId));
      setError(apiErrorMessage(cause));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    busy,
    status,
    error,
    photos,
    photoFileIds: photos.map((photo) => photo.fileId),
    takePhoto,
    pickPhoto,
    removePhoto,
  };
}

export type UseCatalogPhotoResult = ReturnType<typeof useCatalogPhoto>;
