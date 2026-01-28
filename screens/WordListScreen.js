import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 根据平台选择性地导入原生模块
let File, FileSystem, Sharing;
if (Platform.OS !== 'web') {
  // 只在原生平台导入这些模块
  ({ File, FileSystem } = require('expo-file-system'));
  Sharing = require('expo-sharing');
}

const WordListScreen = ({ words, deleteWord, clearAllWords }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤单词
  const filteredWords = words.filter(word => 
    word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.chinese.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 统一的提示函数（支持三端）
  const showAlert = (title, message, buttons = [], options = {}) => {
    if (Platform.OS === 'web') {
      // Web 端使用浏览器原生 alert/confirm
      if (buttons.length >= 2) {
        // 确认对话框
        const result = window.confirm(`${title}\n${message}`);
        if (result && buttons[1] && buttons[1].onPress) {
          buttons[1].onPress();
        }
      } else {
        // 简单提示
        window.alert(`${title}\n${message}`);
      }
    } else {
      // iOS 和 Android 使用 React Native Alert
      Alert.alert(title, message, buttons, options);
    }
  };

  // 统一的确认对话框函数
  const showConfirm = (title, message, onConfirm, onCancel = () => {}) => {
    if (Platform.OS === 'web') {
      const result = window.confirm(`${title}\n${message}`);
      if (result) {
        onConfirm();
      } else {
        onCancel();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: '取消', style: 'cancel', onPress: onCancel },
          { text: '确认', style: 'destructive', onPress: onConfirm }
        ]
      );
    }
  };

  // Web 端的文件下载功能
  const downloadFileOnWeb = (content, filename) => {
    try {
      // 创建 Blob 对象
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 释放 URL 对象
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Web端文件下载失败:', error);
      return false;
    }
  };

  // 导出单词（三端适配）
  const exportWords = async () => {
    if (words.length === 0) {
      showAlert('提示', '没有单词可导出');
      return;
    }

    // 拼接文件内容
    const content = words
      .map(word => `${word.english},${word.chinese}`)
      .join('\n');
    const filename = 'vocabulary_words.txt';

    // Web 端处理
    if (Platform.OS === 'web') {
      const success = downloadFileOnWeb(content, filename);
      if (success) {
        showAlert('成功', '单词已导出并开始下载');
      } else {
        showAlert('错误', '导出单词失败，请重试');
      }
      return;
    }

    // 原生平台处理（Android/iOS）
    try {
      // 容错判断：确保 FileSystem 和 documentDirectory 存在
      if (!FileSystem || !FileSystem.documentDirectory) {
        showAlert('错误', '无法获取文件目录，导出失败');
        console.error('FileSystem 或 documentDirectory 为 undefined');
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      const targetFile = new File(fileUri);
      
      await targetFile.writeAsStringAsync(content, {
        encoding: File.Encoding.UTF8,
        overwrite: true,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        showAlert('成功', '单词已导出并分享');
      } else {
        showAlert('提示', `分享功能不可用，文件已保存到: ${fileUri}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      showAlert('错误', '导出单词失败');
    }
  };

  // 确认清空所有单词
  const confirmClearAll = () => {
    if (words.length === 0) {
      showAlert('提示', '没有单词可清空');
      return;
    }

    showConfirm(
      '确认',
      '确定要清空所有单词吗？此操作不可恢复！',
      clearAllWords
    );
  };

  // 删除单个单词的确认
  const confirmDeleteWord = (wordId, wordText) => {
    showConfirm(
      '确认删除',
      `确定要删除单词 "${wordText}" 吗？`,
      () => deleteWord(wordId)
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
        onPress={() => confirmDeleteWord(item.id, item.english)}
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
          <TouchableOpacity 
            style={styles.button} 
            onPress={exportWords}
            disabled={words.length === 0}
          >
            <Ionicons 
              name="download-outline" 
              size={20} 
              color={words.length === 0 ? "#ccc" : "#3B82F6"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={confirmClearAll}
            disabled={words.length === 0}
          >
            <Ionicons 
              name="trash-outline" 
              size={20} 
              color={words.length === 0 ? "#ccc" : "#ff3b30"} 
            />
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
          {...(Platform.OS === 'web' ? { 
            // Web 端特定的属性
            onKeyPress: (e) => {
              if (e.key === 'Escape') {
                setSearchTerm('');
              }
            }
          } : {})}
        />
      </View>

      {filteredWords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchTerm ? '没有找到匹配的单词' : '暂无单词，请添加新单词'}
          </Text>
          {searchTerm && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Text style={styles.clearSearchText}>清除搜索</Text>
            </TouchableOpacity>
          )}
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
          {...(Platform.OS === 'web' ? {
            // Web 端优化滚动
            style: { maxHeight: 'calc(100vh - 200px)' }
          } : {})}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.wordCount}>
          共 {words.length} 个单词
          {searchTerm && filteredWords.length !== words.length && 
            ` (${filteredWords.length} 个匹配)`}
        </Text>
        {Platform.OS === 'web' && (
          <Text style={styles.platformHint}>
            网页版 • 支持导入导出
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    ...(Platform.OS === 'web' ? {
      // Web 端特定样式
      maxWidth: 800,
      marginHorizontal: 'auto',
      width: '100%',
    } : {})
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      // Web 端优化
      paddingTop: Platform.OS === 'web' ? 8 : 0,
    } : {})
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    ...(Platform.OS === 'ios' ? {
      // iOS 特定样式
      fontFamily: 'System',
    } : Platform.OS === 'android' ? {
      // Android 特定样式
      fontFamily: 'Roboto',
    } : {})
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.05)' : 'transparent',
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
    ...(Platform.OS === 'web' ? {
      // Web 端优化
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      ':focus-within': {
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
      }
    } : {})
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none',
    } : {})
  },
  listContainer: {
    gap: 8,
    ...(Platform.OS === 'web' ? {
      paddingBottom: 20,
    } : {})
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
    ...(Platform.OS === 'web' ? {
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }
    } : {})
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
    borderRadius: 4,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
      }
    } : {})
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
  clearSearchText: {
    fontSize: 14,
    color: '#3B82F6',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  wordCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  platformHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default WordListScreen;