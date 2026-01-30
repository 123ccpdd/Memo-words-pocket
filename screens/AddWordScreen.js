import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const AddWordScreen = ({ addWord, importWords }) => {
  const [english, setEnglish] = useState('');
  const [chinese, setChinese] = useState('');
  const [importStatus, setImportStatus] = useState('');

  // 处理添加单词
  const handleAddWord = () => {
    if (!english.trim() || !chinese.trim()) {
      Alert.alert('提示', '请输入英文单词和中文释义');
      return;
    }

    const success = addWord(english, chinese);
    
    if (success) {
      setEnglish('');
      setChinese('');
      Alert.alert('成功', '单词添加成功');
    } else {
      Alert.alert('提示', '该单词已存在');
    }
  };

  // 选择并导入TXT文件
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // 读取文件内容
      const fileContent = await fetch(result.assets[0].uri)
        .then(response => response.text());

      // 解析文件内容
      const lines = fileContent.split('\n');
      const newWords = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          const parts = trimmedLine.split(',');
          if (parts.length >= 2) {
            const eng = parts[0].trim();
            const chn = parts.slice(1).join(',').trim();
            
            if (eng && chn) {
              newWords.push({
                id: Date.now().toString() + Math.random(),
                english: eng,
                chinese: chn,
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      });

      // 导入单词
      const importedCount = importWords(newWords);
      setImportStatus(`导入完成：成功导入 ${importedCount} 个单词`);
      
      setTimeout(() => {
        setImportStatus('');
      }, 3000);

    } catch (error) {
      console.error('导入失败:', error);
      Alert.alert('错误', '导入单词失败，请检查文件格式');
    }
  };

  const openDeepSeek = async () => {
    const url = 'https://chat.deepseek.com';
    
    try {
      // 检查是否可以打开该链接
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        // 打开DeepSeek官网
        await Linking.openURL(url);
      } else {
        Alert.alert('错误', '无法打开该链接');
      }
    } catch (error) {
      console.error('打开链接失败:', error);
      Alert.alert('错误', '打开链接失败');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>添加新单词</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>英文单词</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：apple"
          placeholderTextColor="#999"
          value={english}
          onChangeText={setEnglish}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>中文释义</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：苹果"
          placeholderTextColor="#999"
          value={chinese}
          onChangeText={setChinese}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddWord}>
        <Ionicons name="add-circle-outline" size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>添加单词</Text>
      </TouchableOpacity>

      <View style={styles.importSection}>
        <Text style={styles.sectionTitle}>批量导入单词</Text>
        <Text style={styles.importHint}>上传TXT文件，格式：英文,中文（每行一个单词）</Text>

        <View style={styles.importControls}>
          <TouchableOpacity style={styles.importButton} onPress={pickFile}>
            <Text style={styles.importText}>选择TXT文件</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.importControls}>
          <TouchableOpacity style={styles.importButton} onPress={openDeepSeek}>
            <Text style={styles.importText}>点击进入deepSeek自动生成txt</Text>
          </TouchableOpacity>
        </View>        

        {importStatus ? (
          <Text style={styles.importStatus}>{importStatus}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1E293B',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 32,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  importSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  importHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  importControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  importButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    padding: 12,
    borderRadius: 8,
  },
  importIcon: {
    marginRight: 8,
  },
  importText: {
    color: '#666',
    fontSize: 14,
  },
  importStatus: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
  },
});

export default AddWordScreen;
