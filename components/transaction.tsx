import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  date: string;
  amount: string;
};

export default function Transaction({ title, date, amount }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopColor: '#E6E6E8',
    borderTopWidth: 2,
  },
  left: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#018007ff',
  },
});