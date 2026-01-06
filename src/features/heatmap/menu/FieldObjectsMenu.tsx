import { useEffect } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FieldObjectData } from '@src/modeles/heatmapView';
import type { FC } from 'react';

import { Divider } from '@src/component/atoms/Divider';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Selector } from '@src/component/molecules/Selector';
import { InputRow } from '@src/features/heatmap/menu/InputRow';
import { useFieldObjectPatch, useFieldObjectSelect } from '@src/hooks/useFieldObject';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useFieldObjectTypes } from '@src/modeles/heatmapView';
import { getRandomPrimitiveColor } from '@src/utils/color';
import { availableIcons } from '@src/utils/heatmapIconMap';

// Default HVQL script for HandChangeItem field objects
const HAND_CHANGE_ITEM_HVQL = `
map status.hand {
  rock     -> icon: hand-rock;
  paper    -> icon: hand-paper;
  scissors  -> icon: hand-scissor;
  *        -> icon: hand-paper;
}
`;

const Component: FC<HeatmapMenuProps> = ({ service }) => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const objects = useFieldObjectSelect((s) => s.objects);
  const queryText = useFieldObjectSelect((s) => s.queryText);
  const setFieldObjects = useFieldObjectPatch();

  const { data: objectTypes } = useFieldObjectTypes(service.projectId ?? undefined, service.sessionId ?? undefined);

  useEffect(() => {
    if (objectTypes && Array.isArray(objectTypes.data)) {
      // 現在のオブジェクトタイプ列を取り出す
      const currentTypes = objects.map((e) => e.objectType);

      const setA = new Set(objectTypes.data);
      const setB = new Set(currentTypes);
      const isSameSet = setA.size === setB.size && [...setA].every((k) => setB.has(k));
      if (isSameSet) {
        return;
      }
      const fieldObjectDatas: FieldObjectData[] = (objectTypes.data as string[]).map((type) => {
        const index = objects.findIndex((e) => e.objectType === type);

        // Auto-assign HVQL script for HandChangeItem objects
        let hvqlScript = objects[index]?.hvqlScript;
        if (type === 'HandChangeItem' && !hvqlScript) {
          hvqlScript = HAND_CHANGE_ITEM_HVQL;
        }

        return {
          objectType: type,
          visible: index !== -1 ? objects[index].visible : true,
          color: objects[index]?.color || getRandomPrimitiveColor(),
          iconName: objects[index]?.iconName || 'spawn',
          hvqlScript,
        };
      });
      setFieldObjects({ objects: fieldObjectDatas });
    }
  }, [objectTypes, objects, setFieldObjects]);

  return (
    <InlineFlexColumn gap={8}>
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={t('heatmap.fieldObject.title')} fontSize={theme.typography.fontSize.lg} fontWeight={theme.typography.fontWeight.bold} />
      </InlineFlexRow>
      <Divider orientation={'horizontal'} />
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={t('heatmap.fieldObject.hvqlQuery')} fontSize={theme.typography.fontSize.sm} />
      </InlineFlexRow>
      <textarea
        value={queryText}
        onChange={(e) => {
          setFieldObjects({ queryText: e.target.value });
        }}
        placeholder={HAND_CHANGE_ITEM_HVQL}
        style={{
          width: '100%',
          height: '120px',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          resize: 'vertical',
        }}
      />
      <Divider orientation={'horizontal'} />
      <InlineFlexRow align={'center'} gap={4}>
        <Text text={t('heatmap.fieldObject.types')} fontSize={theme.typography.fontSize.sm} />
      </InlineFlexRow>
      <InlineFlexColumn align={'center'} gap={4}>
        {objectTypes?.data &&
          Array.isArray(objectTypes.data) &&
          (objectTypes.data as string[]).map((type) => {
            const index = objects.findIndex((e) => e.objectType === type);
            return (
              <InputRow key={type} label={type}>
                <Switch
                  label={type}
                  onChange={(checked) => {
                    const newObjects = objects.map((e) => ({ ...e }));
                    if (index !== -1) {
                      newObjects[index].visible = checked;
                    } else {
                      const hvqlScript = type === 'HandChangeItem' ? HAND_CHANGE_ITEM_HVQL : undefined;
                      newObjects.push({ objectType: type, visible: checked, color: '#000000', iconName: 'spawn', hvqlScript });
                    }
                    setFieldObjects({ objects: newObjects });
                  }}
                  checked={index !== -1 ? objects[index].visible : false}
                  size={'small'}
                />
                {objects[index] && objects[index].color && (
                  <>
                    <input
                      type={'color'}
                      color={objects[index].color}
                      onChange={(e) => {
                        const newObjects = objects.map((e) => ({ ...e }));
                        if (index !== -1) {
                          newObjects[index].color = e.target.value;
                        } else {
                          const hvqlScript = type === 'HandChangeItem' ? HAND_CHANGE_ITEM_HVQL : undefined;
                          newObjects.push({ objectType: type, visible: false, color: e.target.value, iconName: 'spawn', hvqlScript });
                        }
                        setFieldObjects({ objects: newObjects });
                      }}
                    />
                    <Selector
                      options={availableIcons}
                      onChange={(iconName) => {
                        const newObjects = objects.map((e) => ({ ...e }));
                        if (index !== -1) {
                          newObjects[index].iconName = iconName;
                        } else {
                          const hvqlScript = type === 'HandChangeItem' ? HAND_CHANGE_ITEM_HVQL : undefined;
                          newObjects.push({ objectType: type, visible: false, color: '#000000', iconName, hvqlScript });
                        }
                        setFieldObjects({ objects: newObjects });
                      }}
                    />
                  </>
                )}
              </InputRow>
            );
          })}
      </InlineFlexColumn>
    </InlineFlexColumn>
  );
};

export const FieldObjectsMenuContent = Component;
