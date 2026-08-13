import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { apiErrorMessage } from '@/api/client';
import {
  fetchTestImage,
  putSignedUpload,
  signImageUpload,
  verifyImageUpload,
  type FileRow,
} from '@/api/img';

type ContentType = 'image/jpeg' | 'image/png' | 'image/webp';

function mimeFromUri(uri: string, fallback: string | undefined): ContentType {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png') || fallback === 'image/png') return 'image/png';
  if (lower.endsWith('.webp') || fallback === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

export function useImgUploadTest() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [file, setFile] = useState<FileRow | null>(null);
  const [readUrl, setReadUrl] = useState<string | null>(null);

  const runUploadFlow = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    setFile(null);
    setReadUrl(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setStatus('Media library permission denied.');
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: false,
      });

      if (picked.canceled || !picked.assets[0]) {
        setStatus('Pick cancelled.');
        return;
      }

      const asset = picked.assets[0];
      const contentType = mimeFromUri(asset.uri, asset.mimeType);
      setPreviewUri(asset.uri);
      setStatus('Signing upload…');

      const response = await fetch(asset.uri);
      const bytes = await response.arrayBuffer();
      const byteSize = bytes.byteLength;

      const signed = await signImageUpload({
        content_type: contentType,
        byte_size: byteSize,
      });
      setStatus(`Signed ${signed.file_id}. Uploading…`);

      await putSignedUpload({
        uploadUrl: signed.upload_url,
        contentType,
        bytes,
      });
      setStatus('Uploaded. Verifying…');

      const verified = await verifyImageUpload(signed.file_id);
      setFile(verified.file);
      setStatus(
        `Verified ${verified.file.status} · ${verified.verified_size_bytes} bytes`,
      );

      const read = await fetchTestImage(signed.file_id);
      setReadUrl(read.read_url);
      setFile(read.file);
      setStatus(
        `OK — File ${read.file.id} · ${read.file.contentType} · ${read.file.byteSize ?? 0} B`,
      );
    } catch (error) {
      setStatus(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    busy,
    status,
    previewUri,
    file,
    readUrl,
    runUploadFlow,
  };
}
