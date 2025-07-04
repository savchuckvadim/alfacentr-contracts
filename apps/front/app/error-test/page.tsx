'use client';

import { useState } from 'react';
import { fetchParticipants } from '@/modules/entities/participant/model/ParticipantThunk';
import { errorHandler } from '@/modules/app/lib/error-handler';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';

export default function DevPage() {
  const dispatch = useAppDispatch();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testThunkError = async () => {
    try {
      addResult('Тестируем ошибку в thunk...');
      // Вызываем thunk с неверным dealId, чтобы вызвать ошибку
      await dispatch(fetchParticipants('invalid-deal-id'));
    } catch (error) {
      addResult(`Thunk ошибка поймана: ${error}`);
    }
  };

  const testDirectError = () => {
    addResult('Тестируем прямую ошибку...');
    // Создаем ошибку напрямую
    const error = new Error('Тестовая ошибка из dev страницы');
    errorHandler.handleError(error);
  };

  const testCriticalError = () => {
    addResult('Тестируем критическую ошибку...');
    // Создаем критическую ошибку
    errorHandler.createCriticalError('Критическая ошибка: Ошибка получения участников');
  };

  const testAsyncError = async () => {
    addResult('Тестируем асинхронную ошибку...');
    try {
      // Симулируем асинхронную ошибку
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Асинхронная тестовая ошибка'));
        }, 100);
      });
    } catch (error) {
      errorHandler.handleAsyncError(error);
    }
  };

  const testThrowError = () => {
    addResult('Тестируем throw ошибку...');
    // Просто бросаем ошибку
    throw new Error('Ошибка через throw');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1>Страница тестирования ошибок</h1>
      
      <div style={{ marginBottom: 32 }}>
        <h2>Тесты ErrorBoundary</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <button 
            onClick={testThunkError}
            style={{ padding: '12px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Тест Thunk Ошибки
          </button>
          
          <button 
            onClick={testDirectError}
            style={{ padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Тест Прямой Ошибки
          </button>
          
          <button 
            onClick={testCriticalError}
            style={{ padding: '12px 24px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Тест Критической Ошибки
          </button>
          
          <button 
            onClick={testAsyncError}
            style={{ padding: '12px 24px', background: '#ffc107', color: 'black', border: 'none', borderRadius: 4 }}
          >
            Тест Асинхронной Ошибки
          </button>
          
          <button 
            onClick={testThrowError}
            style={{ padding: '12px 24px', background: '#fd7e14', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Тест Throw Ошибки
          </button>
          
          <button 
            onClick={clearResults}
            style={{ padding: '12px 24px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Очистить результаты
          </button>
        </div>
      </div>

      <div>
        <h3>Результаты тестов:</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: 16, 
          borderRadius: 4, 
          maxHeight: 300, 
          overflow: 'auto',
          border: '1px solid #dee2e6'
        }}>
          {testResults.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>Нет результатов тестов</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: 8, fontSize: 14 }}>
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: '#e9ecef', borderRadius: 4 }}>
        <h3>Инструкции:</h3>
        <ul>
          <li><strong>Тест Thunk Ошибки:</strong> Вызывает thunk с неверным dealId</li>
          <li><strong>Тест Прямой Ошибки:</strong> Создает обычную ошибку через ErrorHandler</li>
          <li><strong>Тест Критической Ошибки:</strong> Создает критическую ошибку (должна показать ErrorPage)</li>
          <li><strong>Тест Асинхронной Ошибки:</strong> Симулирует асинхронную ошибку</li>
          <li><strong>Тест Throw Ошибки:</strong> Бросает ошибку напрямую (должен вызвать ErrorBoundary)</li>
        </ul>
      </div>

      <div style={{ marginTop: 16, padding: 16, background: '#fff3cd', borderRadius: 4, border: '1px solid #ffeaa7' }}>
        <h3>Ожидаемое поведение:</h3>
        <ul>
          <li><strong>В development режиме:</strong> Все ошибки должны показывать ErrorPage</li>
          <li><strong>В production режиме:</strong> Только критические ошибки показывают ErrorPage</li>
          <li><strong>Критические ошибки:</strong> Содержат ключевые слова из списка в ErrorHandler</li>
        </ul>
      </div>
    </div>
  );
} 