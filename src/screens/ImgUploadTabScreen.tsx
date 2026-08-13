import { StatusBar } from 'expo-status-bar';
import { ImgUpload } from '@/features/imgUpload';

/** Temp authenticated tab for ASE-11 image upload smoke. */
export function ImgUploadTabScreen() {
  return (
    <>
      <StatusBar style="dark" />
      <ImgUpload />
    </>
  );
}
