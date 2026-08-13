import { useCallback, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  createCatalogItem,
  fetchItemCategories,
  fetchItemMaterials,
  type CatalogItem,
  type ItemCategory,
  type ItemMaterialOption,
} from '@/api/catalog';

type Args = {
  warehouseId: string;
  photoFileIds: string[];
};

export function useCatalogDetails({ warehouseId, photoFileIds }: Args) {
  const [name, setName] = useState('');
  const [quantityText, setQuantityText] = useState('1');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [material, setMaterial] = useState<string | null>(null);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [materials, setMaterials] = useState<ItemMaterialOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const [nextCategories, nextMaterials] = await Promise.all([
        fetchItemCategories(),
        fetchItemMaterials(),
      ]);
      setCategories(nextCategories);
      setMaterials(nextMaterials);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const submit = useCallback(async (): Promise<CatalogItem | null> => {
    const trimmedName = name.trim();
    const quantity = Number(quantityText);

    if (!trimmedName) {
      setError('Name is required.');
      return null;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Quantity must be a whole number greater than 0.');
      return null;
    }

    if (photoFileIds.length === 0) {
      setError('At least one photo is required.');
      return null;
    }

    setBusy(true);
    setError(null);
    try {
      return await createCatalogItem({
        warehouseId,
        name: trimmedName,
        quantity,
        photoFileIds,
        categoryId,
        material,
      });
    } catch (cause) {
      setError(apiErrorMessage(cause));
      return null;
    } finally {
      setBusy(false);
    }
  }, [categoryId, material, name, photoFileIds, quantityText, warehouseId]);

  return {
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
    submit,
  };
}

export type UseCatalogDetailsResult = ReturnType<typeof useCatalogDetails>;
