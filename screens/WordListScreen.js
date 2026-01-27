import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 关键：正确导入 File 类和 FileSystem（完整导出，确保包含 documentDirectory）
import { File, FileSystem } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const WordListScreen = ({ words, deleteWord, clearAllWords }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤单词
  const filteredWords = words.filter(word => 
    word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.chinese.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 导出单词（优化：增加 FileSystem 容错判断）
  const exportWords = async () => {
    if (words.length === 0) {
      Alert.alert('提示', '没有单词可导出');
      return;
    }

    // 容错判断：确保 FileSystem 和 documentDirectory 存在
    if (!FileSystem || !FileSystem.documentDirectory) {
      Alert.alert('错误', '无法获取文件目录，导出失败');
      console.error('FileSystem 或 documentDirectory 为 undefined');
      return;
    }

    // 拼接文件内容
    const content = words
      .map(word => `${word.english},${word.chinese}`)
      .join('\n');

    // 正确使用 FileSystem.documentDirectory 构建文件 URI
    const fileUri = `${FileSystem.documentDirectory}vocabulary_words.txt`;
    
    try {
      const targetFile = new File(fileUri);
      await targetFile.writeAsStringAsync(content, {
        encoding: File.Encoding.UTF8,
        overwrite: true,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('提示', '分享功能不可用，文件已保存到: ' + fileUri);
      }
    } catch (error) {
      console.error('导出失败:', error);
      Alert.alert('错误', '导出单词失败');
    }
  };

  // 确认清空所有单词
  const confirmClearAll = () => {
    if (words.length === 0) {
      Alert.alert('提示', '没有单词可清空');
      return;
    }

    Alert.alert(
      '确认',
      '确定要清空所有单词吗？此操作不可恢复！',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认', style: 'destructive', onPress: clearAllWords }
      ]
    );
  };

  // 渲染单个单词项
  const renderWordItem = ({ item, index }) => (
    <View style={styles.wordItem}>
      <View style={styles.wordInfo}>
        <Text style={styles.wordIndex}>{index + 1}.</Text>
        <View>
          <Text style={styles.englishWord}>{item.english}</Text>
          <Text style={styles.chineseMeaning}>{item.chinese}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteWord(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>单词列表</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.button} onPress={exportWords}>
            <Ionicons name="download-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={confirmClearAll}>
            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索单词..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
      </View>

      {filteredWords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>暂无单词，请添加新单词</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWords}
          renderItem={renderWordItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      <Text style={styles.wordCount}>
        共 {words.length} 个单词
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    gap: 8,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordIndex: {
    fontSize: 16,
    color: '#666',
    width: 24,
  },
  englishWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  chineseMeaning: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  wordCount: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default WordListScreen;