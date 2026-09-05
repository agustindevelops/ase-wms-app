import { Image, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Camera from 'lucide-react-native/icons/camera';
import Images from 'lucide-react-native/icons/images';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseCatalogPhotoResult } from '../hook/useCatalogPhoto';

const ICON_ON_GREEN = '#ffffff';
const ICON_ON_CREAM = '#473b33';

export type CatalogPhotoViewProps = UseCatalogPhotoResult & {
  onContinue: () => void;
};

export function CatalogPhotoView({
  busy,
  loading,
  editing,
  status,
  error,
  photos,
  takePhoto,
  pickPhoto,
  removePhoto,
  onContinue,
}: CatalogPhotoViewProps) {
  const hasPhotos = photos.length > 0;
  const blocked = busy || loading;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <VStack className="px-6 pt-4 pb-8 gap-3.5">
          <Text size="sm" className="text-brown-500">
            {editing
              ? 'Keep the current photos, or add and remove before updating the item.'
              : 'Crop each photo to any aspect ratio before it saves, then add as many as you need.'}
          </Text>

          {hasPhotos ? (
            <VStack className="gap-3">
              <Text size="sm" bold className="text-brown-800">
                Photos ({photos.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack className="gap-3 pr-2">
                  {photos.map((photo, index) => (
                    <VStack key={photo.fileId} className="gap-1.5 w-28">
                      <Box className="w-28 h-28 rounded-2xl overflow-hidden border border-brown-200 bg-white/70">
                        {photo.previewUri ? (
                          <Image
                            source={{ uri: photo.previewUri }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        ) : null}
                      </Box>
                      <Text size="xs" className="text-brown-500">
                        #{index + 1}
                      </Text>
                      <Pressable
                        onPress={() => void removePhoto(photo.fileId)}
                        disabled={blocked}
                      >
                        <Text size="xs" bold className="text-destructive">
                          Remove
                        </Text>
                      </Pressable>
                    </VStack>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>
          ) : (
            <Box className="w-full aspect-square rounded-2xl border border-dashed border-brown-200 bg-white/70 items-center justify-center px-6">
              {loading ? (
                <Spinner color="#7e9570" />
              ) : (
                <Text size="sm" className="text-brown-500 text-center">
                  No photos yet. Take or pick one, then crop to save it.
                </Text>
              )}
            </Box>
          )}

          {busy ? <Spinner size="large" color="#7e9570" /> : null}

          {status ? (
            <Text size="sm" className="text-brown-500">
              {status}
            </Text>
          ) : null}

          {error ? (
            <Text size="sm" bold className="text-destructive">
              {error}
            </Text>
          ) : null}

          <HStack className="gap-3">
            <Button
              className="flex-1"
              onPress={() => void takePhoto()}
              disabled={blocked}
              accessibilityLabel={hasPhotos ? 'Take another photo' : 'Take photo'}
            >
              {busy ? (
                <ButtonSpinner />
              ) : (
                <Camera size={20} color={ICON_ON_GREEN} />
              )}
              <ButtonText>Camera</ButtonText>
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => void pickPhoto()}
              disabled={blocked}
              accessibilityLabel="Add photo from library"
            >
              <Images size={20} color={ICON_ON_CREAM} />
              <ButtonText style={{ color: ICON_ON_CREAM }}>Gallery</ButtonText>
            </Button>
          </HStack>

          <Button
            variant="secondary"
            className="mt-2"
            onPress={onContinue}
            disabled={blocked || !hasPhotos}
          >
            <ButtonText>
              {hasPhotos
                ? `Continue with ${photos.length} photo${photos.length === 1 ? '' : 's'}`
                : 'Continue'}
            </ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
