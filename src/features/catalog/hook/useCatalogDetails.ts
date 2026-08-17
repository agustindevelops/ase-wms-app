import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  createCatalogItem,
  fetchCatalogItem,
  fetchItemCategories,
  fetchItemMaterials,
  updateCatalogItem,
  type CatalogItem,
  type ItemCategory,
  type ItemMaterialOption,
} from '@/api/catalog';

type Args = {
  warehouseId: string;
  photoFileIds: string[];
  itemId?: string | null;
};

export function useCatalogDetails({
  warehouseId,
  photoFileIds,
  itemId: initialItemId,
}: Args) {
  const [itemId, setItemId] = useState<string | null>(initialItemId ?? null);
  const [name, setName] = useState('');
  const [quantityText, setQuantityText] = useState('1');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [material, setMaterial] = useState<string | null>(null);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [materials, setMaterials] = useState<ItemMaterialOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialItemId && initialItemId !== itemId) {
      setItemId(initialItemId);
    }
  }, [initialItemId, itemId]);

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

  const loadItem = useCallback(async (id: string) => {
    try {
      const item = await fetchCatalogItem(id);
      setName(item.name);
      setQuantityText(String(item.quantityOwned || 1));
      setCategoryId(item.categoryId);
      setMaterial(item.material ?? null);
      setItemId(item.id);
    } catch (cause) {
      setError(apiErrorMessage(cause));
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
      const fields = {
        name: trimmedName,
        quantity,
        photoFileIds,
        categoryId,
        material,
      };
      const item = itemId
        ? await updateCatalogItem(itemId, fields)
        : await createCatalogItem({ warehouseId, ...fields });
      setItemId(item.id);
      return item;
    } catch (cause) {
      setError(apiErrorMessage(cause));
      return null;
    } finally {
      setBusy(false);
    }
  }, [categoryId, itemId, material, name, photoFileIds, quantityText, warehouseId]);

  return {
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
    setItemId,
    setName,
    setQuantityText,
    setCategoryId,
    setMaterial,
    loadCategories,
    loadItem,
    submit,
  };
}

export type UseCatalogDetailsResult = ReturnType<typeof useCatalogDetails>;
