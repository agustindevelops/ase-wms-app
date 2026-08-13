import { Image } from 'react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useImgUploadTest } from '@/features/imgUpload/hook/useImgUploadTest';

/** Temp tab UI: sign → PUT → verify → /api/test/img. */
export function ImgUploadTestView() {
  const { busy, status, previewUri, file, readUrl, runUploadFlow } =
    useImgUploadTest();

  return (
    <Box className="flex-1 bg-cream px-6 pt-12">
      <VStack className="gap-3">
        <Heading size="2xl" className="text-brown-900">
          Img upload
        </Heading>
        <Text size="sm" className="text-brown-500">
          Temp ASE-11 smoke: pick image → sign → PUT → verify → read URL.
        </Text>

        <Button onPress={runUploadFlow} disabled={busy}>
          {busy ? <ButtonSpinner /> : null}
          <ButtonText>{busy ? 'Working…' : 'Pick & upload'}</ButtonText>
        </Button>

        {status ? (
          <Text
            size="sm"
            bold={!status.startsWith('OK')}
            className={
              status.startsWith('OK') ? 'text-brown-700' : 'text-destructive'
            }
          >
            {status}
          </Text>
        ) : null}

        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={{ width: '100%', height: 180, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : null}

        {file ? (
          <VStack className="gap-1">
            <Text size="sm" className="text-brown-700">
              id: {file.id}
            </Text>
            <Text size="sm" className="text-brown-700">
              key: {file.s3Key}
            </Text>
            <Text size="sm" className="text-brown-700">
              status: {file.status}
            </Text>
            {file.publicUrl ? (
              <Text size="sm" className="text-brown-700">
                publicUrl: {file.publicUrl}
              </Text>
            ) : null}
          </VStack>
        ) : null}

        {readUrl ? (
          <Image
            source={{ uri: readUrl }}
            style={{ width: '100%', height: 180, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : null}
      </VStack>
    </Box>
  );
}
