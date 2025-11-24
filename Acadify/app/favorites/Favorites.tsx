import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Favorites: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Favorites Screen</Text>
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { fontSize: 18 },
});
