import React, { useState } from 'react';
import styled from 'styled-components';

const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 12px;
  background: ${props => props.$active ? '#007bff' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#333'};
  border: 1px solid ${props => props.$active ? '#007bff' : '#e0e0e0'};
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.6 : 1};
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DevicePreviewButton = styled(Button)`
  min-width: 40px;
  justify-content: center;
`;

const SaveButton = styled(Button)`
  background: #28a745;
  color: #fff;
  border-color: #28a745;

  &:hover:not(:disabled) {
    background: #218838;
  }
`;

const TopBar = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const [devicePreview, setDevicePreview] = useState('desktop');

  const handleDevicePreview = (device) => {
    setDevicePreview(device);
    // TODO: Implement preview mode change logic
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving page...');
  };

  return (
    <TopBarContainer>
      <ToolGroup>
        <Button 
          onClick={onUndo} 
          $disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↩ Undo
        </Button>
        <Button 
          onClick={onRedo} 
          $disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↪ Redo
        </Button>
      </ToolGroup>

      <ToolGroup>
        <DevicePreviewButton
          $active={devicePreview === 'desktop'}
          onClick={() => handleDevicePreview('desktop')}
          title="Desktop Preview"
        >
          🖥️
        </DevicePreviewButton>
        <DevicePreviewButton
          $active={devicePreview === 'tablet'}
          onClick={() => handleDevicePreview('tablet')}
          title="Tablet Preview"
        >
          📱
        </DevicePreviewButton>
        <DevicePreviewButton
          $active={devicePreview === 'mobile'}
          onClick={() => handleDevicePreview('mobile')}
          title="Mobile Preview"
        >
          📱
        </DevicePreviewButton>
      </ToolGroup>

      <ToolGroup>
        <SaveButton onClick={handleSave}>
          💾 Save
        </SaveButton>
      </ToolGroup>
    </TopBarContainer>
  );
};

export default TopBar; 