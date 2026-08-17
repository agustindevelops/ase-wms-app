import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { UseCatalogDetailsResult } from '../hook/useCatalogDetails';

export type CatalogDetailsViewProps = UseCatalogDetailsResult & {
  onSubmit: () => void | Promise<void>;
};

function OptionRow({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2.5 ${
        selected ? 'border-green-700 bg-green-700/15' : 'border-border bg-card'
      }`}
    >
      <Text size="sm" className="text-brown-900">
        {label}
      </Text>
    </Pressable>
  );
}

export function CatalogDetailsView({
  itemId,
  name,
  quantityText,
  categoryId,
  material,
  categories,
  materials,
  loadingCategories,
  busy,
  error,
  setName,
  setQuantityText,
  setCategoryId,
  setMaterial,
  loadCategories,
  onSubmit,
}: CatalogDetailsViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <VStack className="px-6 pt-4 pb-8 gap-3.5">
            <Text size="sm" className="text-brown-500">
              Name and quantity are required. Category and material are optional.
            </Text>

            <Text size="sm" bold className="text-brown-900">
              Name
            </Text>
            <Input>
              <InputField
                placeholder="Gold chiavari chair"
                value={name}
                onChangeText={setName}
                editable={!busy}
              />
            </Input>

            <Text size="sm" bold className="text-brown-900">
              Quantity
            </Text>
            <Input>
              <InputField
                placeholder="1"
                value={quantityText}
                onChangeText={setQuantityText}
                editable={!busy}
                keyboardType="number-pad"
              />
            </Input>

            <Text size="sm" bold className="text-brown-900">
              Category
            </Text>

            {loadingCategories ? (
              <Spinner />
            ) : (
              <VStack className="gap-2">
                <OptionRow
                  label="None"
                  selected={categoryId === null}
                  disabled={busy}
                  onPress={() => setCategoryId(null)}
                />
                {categories.map((category) => (
                  <OptionRow
                    key={category.id}
                    label={category.name}
                    selected={categoryId === category.id}
                    disabled={busy}
                    onPress={() => setCategoryId(category.id)}
                  />
                ))}
                {categories.length === 0 ? (
                  <VStack className="gap-2">
                    <Text size="sm" className="text-brown-500">
                      No categories loaded.
                    </Text>
                    <Button
                      variant="outline"
                      onPress={() => void loadCategories()}
                      disabled={busy}
                    >
                      <ButtonText>Retry categories</ButtonText>
                    </Button>
                  </VStack>
                ) : null}
              </VStack>
            )}

            <Text size="sm" bold className="text-brown-900">
              Material
            </Text>
            <VStack className="gap-2">
              <OptionRow
                label="None"
                selected={material === null}
                disabled={busy}
                onPress={() => setMaterial(null)}
              />
              {materials.map((option) => (
                <OptionRow
                  key={option.code}
                  label={option.name}
                  selected={material === option.code}
                  disabled={busy}
                  onPress={() => setMaterial(option.code)}
                />
              ))}
            </VStack>

            {error ? (
              <Text size="sm" bold className="text-destructive">
                {error}
              </Text>
            ) : null}

            <Button className="mt-1" onPress={() => void onSubmit()} disabled={busy}>
              {busy ? <ButtonSpinner /> : null}
              <ButtonText>{itemId ? 'Update item' : 'Save item'}</ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
