import React, { useState } from 'react';

function App() {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]); // 検索履歴

  const handleChange = async (e) => {
    const value = e.target.value;
    setTerm(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: value }),
      });
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('サジェスト取得エラー:', error);
    }
  };

  const handleSubmit = async (e, selectedTerm) => {
    if (e) e.preventDefault();
    setLoading(true);
    setDefinition('');
    setSuggestions([]);

    const searchTerm = selectedTerm || term;
    setTerm(searchTerm);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/definition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: searchTerm }),
      });
      const data = await response.json();
      setDefinition(data.definition);

      // 検索履歴更新（重複なし＆最新を先頭に）
      setHistory((prev) => {
        const newHistory = prev.filter((t) => t !== searchTerm);
        return [searchTerm, ...newHistory].slice(0, 10);
      });
    } catch (error) {
      setDefinition('エラーが発生しました。');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '40px auto',
        padding: '24px',
        fontFamily: `'Noto Sans JP', 'Roboto', sans-serif`,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: 24 }}>
        医療用語説明アプリ
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 auto' }}>
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: 14,
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: 20,
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>

          <input
            type="text"
            value={term}
            onChange={handleChange}
            required
            placeholder="医療用語を入力してください"
            style={{
              width: '90%',
              padding: '12px 16px 12px 44px',
              fontSize: 18,
              borderRadius: 24,
              border: '1.5px solid #d1d5db',
              boxShadow: 'none',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 6px #3b82f6aa';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
            disabled={loading}
          />
          {/* サジェストリスト */}
          {suggestions.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '8px 0',
                border: '1.5px solid #d1d5db',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                background: '#fff',
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: 180,
                overflowY: 'auto',
                zIndex: 1000,
              }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSubmit(null, s)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid #e5e7eb',
                    color: '#374151',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#e0e7ff')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            flexShrink: 0,
            width: 120,
            backgroundColor: '#3b82f6',
            color: '#fff',
            borderRadius: 24,
            border: 'none',
            fontSize: 18,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'background-color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
        >
          {loading && (
            <span
              style={{
                width: 18,
                height: 18,
                border: '2.5px solid #fff',
                borderTop: '2.5px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
          {loading ? '検索中...' : '探索'}
        </button>
      </form>

      {/* 検索履歴 */}
      {history.length > 0 && (
        <div
          style={{
            marginBottom: 24,
            backgroundColor: '#fff',
            padding: 16,
            borderRadius: 8,
            boxShadow: '0 3px 12px rgba(0,0,0,0.05)',
            color: '#374151',
          }}
        >
          <h3 style={{ marginBottom: 12, fontWeight: 'bold' }}>検索履歴</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
            {history.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSubmit(null, item)}
                style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                  borderRadius: 6,
                  transition: 'background-color 0.2s ease',
                  userSelect: 'none',
                  marginBottom: 4,
                  backgroundColor: '#f3f4f6',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 定義表示 */}
      {definition && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            color: '#374151',
            fontSize: 18,
            lineHeight: 1.6,
          }}
        >
          <h2 style={{ marginBottom: 12 }}>{term} の説明</h2>
          <p>{definition}</p>
        </div>
      )}

      {/* スピナー用CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}

export default App;
