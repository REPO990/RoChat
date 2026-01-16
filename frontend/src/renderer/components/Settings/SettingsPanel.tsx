import React from 'react';
import { Settings } from '../../types/index';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  const handleChange = (key: keyof Settings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚙️ Settings</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.setting}>
            <label style={styles.label}>Position</label>
            <select
              value={settings.position}
              onChange={(e) => handleChange('position', e.target.value)}
              style={styles.select}
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="roblox-style">Roblox Style</option>
            </select>
          </div>

          <div style={styles.setting}>
            <label style={styles.label}>Opacity: {Math.round(settings.opacity * 100)}%</label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={settings.opacity}
              onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              style={styles.slider}
            />
          </div>

          <div style={styles.setting}>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={settings.alwaysOnTop}
                onChange={(e) => handleChange('alwaysOnTop', e.target.checked)}
                style={styles.checkbox}
              />
              Always on Top
            </label>
          </div>

          <div style={styles.setting}>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={settings.isDraggable}
                onChange={(e) => handleChange('isDraggable', e.target.checked)}
                style={styles.checkbox}
              />
              Draggable Window
            </label>
          </div>

          <div style={styles.setting}>
            <label style={styles.label}>Chat Keybind</label>
            <input
              type="text"
              value={settings.keybind}
              onChange={(e) => handleChange('keybind', e.target.value)}
              placeholder="e.g., Ctrl+Shift+C"
              style={styles.input}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    background: 'white',
    borderRadius: '15px',
    width: '400px',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
  },
  content: {
    padding: '20px',
  },
  setting: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  slider: {
    width: '100%',
  },
  checkbox: {
    marginRight: '10px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
};

export default SettingsPanel;