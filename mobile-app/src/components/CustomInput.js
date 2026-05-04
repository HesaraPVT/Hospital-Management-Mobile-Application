import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, FONTS } from '../theme';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
  numberOfLines,
  style,
  hasPasswordToggle, // new prop
  helperText, // new prop for helper notes
}) => {
  const [focused, setFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.inputFocus],
  });

  return (
    <View style={[styles.group, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View style={[styles.inputWrap, { borderColor }, hasPasswordToggle && styles.inputWrapPassword]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMulti, hasPasswordToggle && styles.inputWithToggle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize="none"
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {hasPasswordToggle && (
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setIsSecure(!isSecure)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleText}>{isSecure ? '👁️' : '🚫'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: FONTS.semibold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.inputBg,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: FONTS.regular,
  },
  inputMulti: {
    textAlignVertical: 'top',
    minHeight: 90,
  },
  inputWrapPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWithToggle: {
    flex: 1,
  },
  toggleBtn: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomInput;