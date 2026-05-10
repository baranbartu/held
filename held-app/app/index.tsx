import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Held</Text>
      <Text style={styles.subtitle}>holds what&apos;s on your mind</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fonts.serif.regular,
    fontSize: 56,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.serif.regularItalic,
    fontSize: 18,
    color: colors.inkSoft,
    marginTop: 8,
  },
});
