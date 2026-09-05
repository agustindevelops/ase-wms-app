import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
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

type SelectOption = {
  value: string | null;
  label: string;
};

function SelectField({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  value: string | null;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const label = selected?.label ?? placeholder;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        className="h-9 w-full flex-row items-center justify-between rounded-md border border-brown-200 bg-white/70 px-3"
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Text
          size="sm"
          className={selected?.value != null ? 'text-brown-800' : 'text-brown-500'}
        >
          {label}
        </Text>
        <ChevronDown size={16} color="#473b33" />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={() => setOpen(false)}
          />
          <View className="bg-cream rounded-t-2xl border border-brown-200 px-4 pt-4 pb-8 max-h-[70%]">
            <Text size="sm" bold className="text-brown-800 mb-3">
              {placeholder}
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <VStack className="gap-1.5">
                {options.map((option) => {
                  const active = option.value === value;
                  return (
                    <Pressable
                      key={option.value ?? 'none'}
                      onPress={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`rounded-lg border px-3 py-2.5 ${
                        active
                          ? 'border-green-700 bg-green-700/15'
                          : 'border-brown-200 bg-white/70'
                      }`}
                    >
                      <Text size="sm" className="text-brown-800">
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </VStack>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
  refreshing,
  busy,
  error,
  setName,
  setQuantityText,
  setCategoryId,
  setMaterial,
  load,
  loadCategories,
  onSubmit,
}: CatalogDetailsViewProps) {
  const categoryOptions: SelectOption[] = [
    { value: null, label: 'None' },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];
  const materialOptions: SelectOption[] = [
    { value: null, label: 'None' },
    ...materials.map((option) => ({
      value: option.code,
      label: option.name,
    })),
  ];

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor="#7e9570"
            />
          }
        >
          <VStack className="px-6 pt-4 pb-8 gap-3.5">
            <Text size="sm" className="text-brown-500">
              Name and quantity are required. Category and material are optional.
            </Text>

            <Text size="sm" bold className="text-brown-800">
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

            <Text size="sm" bold className="text-brown-800">
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

            <Text size="sm" bold className="text-brown-800">
              Category
            </Text>
            {loadingCategories ? (
              <Spinner />
            ) : categories.length === 0 ? (
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
            ) : (
              <SelectField
                value={categoryId}
                options={categoryOptions}
                placeholder="Category"
                disabled={busy}
                onChange={setCategoryId}
              />
            )}

            <Text size="sm" bold className="text-brown-800">
              Material
            </Text>
            <SelectField
              value={material}
              options={materialOptions}
              placeholder="Material"
              disabled={busy || loadingCategories}
              onChange={setMaterial}
            />

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
