import { api } from './client';

export type SignUploadRequest = {
  content_type: 'image/jpeg' | 'image/png' | 'image/webp';
  byte_size?: number;
};

export type SignUploadResponse = {
  file_id: string;
  upload_url: string;
  s3_key: string;
  expires_in: number;
  bucket: string;
  content_type: string;
  status: string;
  signature_expiration: string | null;
};

export type FileRow = {
  id: string;
  itemId: string | null;
  uploadedByUserId: string;
  s3Key: string;
  contentType: string;
  byteSize: number | null;
  status: string;
  signatureExpiration: string | null;
  publicUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type VerifyUploadResponse = {
  file: FileRow;
  verified_content_type: string;
  verified_size_bytes: number;
};

export type ReadImageResponse = {
  file: FileRow;
  read_url: string;
};

/** Create File row + get short-lived presigned PUT URL. */
export async function signImageUpload(
  body: SignUploadRequest,
): Promise<SignUploadResponse> {
  const { data } = await api.post<SignUploadResponse>('/api/img/upload', body);
  return data;
}

/** PUT bytes directly to storage (no Bearer — signature is in the URL). */
export async function putSignedUpload(input: {
  uploadUrl: string;
  contentType: string;
  bytes: ArrayBuffer;
}): Promise<void> {
  const response = await fetch(input.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': input.contentType,
    },
    body: input.bytes,
  });

  if (!response.ok) {
    throw new Error(`Direct upload failed (${response.status}).`);
  }
}

/** Verify stored object matches claim; returns the File DB row. */
export async function verifyImageUpload(
  fileId: string,
): Promise<VerifyUploadResponse> {
  const { data } = await api.post<VerifyUploadResponse>('/api/img/verify', {
    file_id: fileId,
  });
  return data;
}

/** Temp read helper after verify. */
export async function fetchTestImage(
  fileId: string,
): Promise<ReadImageResponse> {
  const { data } = await api.get<ReadImageResponse>('/api/test/img', {
    params: { file_id: fileId },
  });
  return data;
}
