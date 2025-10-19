import { theme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface PickerItem {
  label: string;
  value: string | number;
}

export interface EnhancedPickerProps {
  label?: string;
  isRequired?: boolean;
  value: string | number | null;
  onValueChange: (value: string | number | null) => void;
  items: PickerItem[];
  placeholder?: string;
  error?: string;
  containerStyle?: object;
  enabled?: boolean;
}

export default function EnhancedPicker({
  label,
  isRequired = false,
  value,
  onValueChange,
  items,
  placeholder = 'Select an option',
  error,
  containerStyle = {},
  enabled = true,
}: EnhancedPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const safeToString = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val);
  };

  const selectedItem = items.find((item) => {
    if (value === null || value === undefined || value === '') {
      return item.value === '' || item.value === null || item.value === undefined;
    }

    const itemValueStr = safeToString(item.value);
    const valueStr = safeToString(value);

    return itemValueStr === valueStr;
  });

  const displayText = selectedItem ? selectedItem.label : placeholder;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label} {isRequired && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.pickerButton,
          error && styles.inputError,
          !enabled && styles.disabledInput,
        ]}
        onPress={() => enabled && setModalVisible(true)}
        disabled={!enabled}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedItem && styles.placeholderText,
            !enabled && styles.disabledText,
          ]}
        >
          {displayText}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={enabled ? theme.colors.textLight : '#CCCCCC'}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select an option'}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item, index) => `${safeToString(item.value)}-${index}`}
              renderItem={({ item }) => {
                const isSelected = (() => {
                  if (value === null || value === undefined || value === '') {
                    return (
                      item.value === '' || item.value === null || item.value === undefined
                    );
                  }

                  const itemValueStr = safeToString(item.value);
                  const valueStr = safeToString(value);

                  return itemValueStr === valueStr;
                })();

                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedItem]}
                    onPress={() => {
                      const selectedValue = item.value === '' ? null : item.value;
                      onValueChange(selectedValue);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.danger,
    fontWeight: 'bold',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  disabledText: {
    color: '#A0A0A0',
  },
  inputError: {
    borderColor: theme.colors.danger,
    borderWidth: 1.5,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: theme.colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});