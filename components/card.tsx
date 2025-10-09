import React from 'react';
import { View, Text, StyleProp, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

export default function Card({ children, title, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffffff',
    borderRadius: 10,
    padding: 14,
    marginVertical: 6,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});
