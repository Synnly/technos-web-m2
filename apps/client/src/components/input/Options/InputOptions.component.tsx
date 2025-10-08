import React, { useState } from 'react';
import { Input, Button, List, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { InputOptionsProps } from './InputOptions.interface';

const { Text } = Typography;

const InputOptions: React.FC<InputOptionsProps> = ({ value = {}, onChange, placeholder = "Clé de l'option", className }) => {
  const [keyInput, setKeyInput] = useState('');

  const items = Object.entries(value || {});

  const canAdd = keyInput.trim().length > 0 && !(keyInput in (value || {}));

  const handleAdd = () => {
    const k = keyInput.trim();
    if (!k) return;
    const next = { ...(value || {}), [k]: 0 };
    onChange && onChange(next);
    setKeyInput('');
  };

  const handleDelete = (k: string) => {
    const next = { ...(value || {}) };
    delete next[k];
    onChange && onChange(next);
  };

  return (
    <div className={className}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%' }}>
          <Input
            placeholder={placeholder}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onPressEnter={handleAdd}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={!canAdd}>
            Ajouter
          </Button>
        </Space>

        <div style={{ maxHeight: 220, overflowY: 'auto', width: '100%' }}>
          <List
            bordered
            locale={{ emptyText: 'Aucune option' }}
            dataSource={items}
            renderItem={(item) => {
              const [k, v] = item as [string, number];
              return (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>{k}</Text>
                    <Space>
                      <Text>{v}</Text>
                      <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(k)} />
                    </Space>
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>

        {Object.keys(value || {}).length < 2 && (
          <Text type="warning">Il faut au moins deux options</Text>
        )}
      </Space>
    </div>
  );
};

export default InputOptions;
