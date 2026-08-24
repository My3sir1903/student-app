import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testID?: string;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  testID,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          testID="bottom-sheet-backdrop"
        />
        <View style={styles.anchor} pointerEvents="box-none">
          <KeyboardStickyView>
            <View
              style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
              testID={testID}
            >
              <View style={styles.handle} />
              {title ? (
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  <Pressable
                    onPress={onClose}
                    hitSlop={12}
                    testID="bottom-sheet-close"
                  >
                    <Ionicons name="close" size={24} color={colors.onSurfaceTertiary} />
                  </Pressable>
                </View>
              ) : null}
              {children}
            </View>
          </KeyboardStickyView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  anchor: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display.semibold,
    fontSize: fontSize["2xl"],
    color: colors.onSurface,
    letterSpacing: 0.3,
  },
});
