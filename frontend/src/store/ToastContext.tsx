import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, fontSize, radius, spacing } from "@/src/theme";

interface ToastData {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface ToastContextValue {
  showToast: (data: ToastData) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ToastData | null>(null);
  const translateY = useSharedValue(-160);
  const opacity = useSharedValue(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (next: ToastData) => {
      setData(next);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      translateY.value = withTiming(insets.top + spacing.sm, { duration: 320 });
      opacity.value = withTiming(1, { duration: 220 });
      hideTimer.current = setTimeout(() => {
        translateY.value = withTiming(-160, { duration: 280 });
        opacity.value = withTiming(0, { duration: 220 });
      }, 2600);
    },
    [insets.top, opacity, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[styles.wrap, animatedStyle]}
        testID="app-toast"
      >
        {data ? (
          <View style={styles.toast}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={data.icon ?? "trophy"}
                size={20}
                color={colors.brandPrimary}
              />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title} numberOfLines={1}>
                {data.title}
              </Text>
              {data.message ? (
                <Text style={styles.message} numberOfLines={2}>
                  {data.message}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </Animated.View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  title: {
    fontFamily: fonts.text.bold,
    fontSize: fontSize.base,
    color: colors.onSurface,
  },
  message: {
    fontFamily: fonts.text.regular,
    fontSize: fontSize.sm,
    color: colors.onSurfaceTertiary,
    marginTop: 2,
  },
});
