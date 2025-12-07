import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, GripVertical, X } from "lucide-react";
import { SKINS } from "../../../shared/skins";
import { useTranslation } from "react-i18next";

interface FavoriteSkinsProps {
  favoriteSkinKeys: string[];
  selectedSkin: string;
  onSelectSkin: (skinKey: string) => void;
  onRemoveFavorite: (skinKey: string) => void;
  onReorder: (orderedSkinKeys: string[]) => void;
  isLoading: boolean;
  customSkinsData?: { skins: Array<{ id: number; name: string; description: string | null }> };
}

interface SortableItemProps {
  skinKey: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isLoading: boolean;
  customSkinsData?: { skins: Array<{ id: number; name: string; description: string | null }> };
}

function SortableItem({ skinKey, isSelected, onSelect, onRemove, isLoading, customSkinsData }: SortableItemProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skinKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // カスタムスキンかどうかを判定
  const isCustomSkin = skinKey.startsWith("custom_");
  let skinName = "";
  let skinDescription = "";

  if (isCustomSkin) {
    const customSkinId = parseInt(skinKey.replace("custom_", ""));
    const customSkin = customSkinsData?.skins.find(s => s.id === customSkinId);
    skinName = customSkin?.name || skinKey;
    skinDescription = customSkin?.description || "カスタムスキン";
  } else {
    skinName = t(`skin.${skinKey}`);
    skinDescription = t(`skin.${skinKey}.desc`);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-4 border-2 rounded-xl transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
          : 'border-gray-200 hover:border-purple-300 bg-white'
      } ${isDragging ? 'shadow-2xl z-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* ドラッグハンドル */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          disabled={isLoading}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>

        {/* スキン情報 */}
        <button
          type="button"
          onClick={onSelect}
          disabled={isLoading}
          className="flex-1 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="font-semibold text-sm mb-1">{skinName}</div>
          <div className="text-xs text-gray-600 line-clamp-1">{skinDescription}</div>
        </button>

        {/* 削除ボタン */}
        <button
          type="button"
          onClick={onRemove}
          disabled={isLoading}
          className="p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <X className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export function FavoriteSkins({
  favoriteSkinKeys,
  selectedSkin,
  onSelectSkin,
  onRemoveFavorite,
  onReorder,
  isLoading,
  customSkinsData,
}: FavoriteSkinsProps) {
  const [items, setItems] = useState(favoriteSkinKeys);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // favoriteSkinKeysが変更されたらitemsを更新
  useEffect(() => {
    if (JSON.stringify(items) !== JSON.stringify(favoriteSkinKeys)) {
      setItems(favoriteSkinKeys);
    }
  }, [favoriteSkinKeys]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onReorder(newItems);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900">お気に入りスキン</h3>
        <span className="text-sm text-gray-500">（ドラッグして並び替え）</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((skinKey) => (
              <SortableItem
                key={skinKey}
                skinKey={skinKey}
                isSelected={selectedSkin === skinKey}
                onSelect={() => onSelectSkin(skinKey)}
                onRemove={() => onRemoveFavorite(skinKey)}
                isLoading={isLoading}
                customSkinsData={customSkinsData}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
