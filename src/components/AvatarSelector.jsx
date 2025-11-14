import { useState } from 'react';
import '../styles/avatar.css';

const avatars = [
  '😀', '😎', '🤓', '😇', '🤩', '🥳', '🤖', '👾',
  '👨‍💻', '👩‍💻', '🧑‍🚀', '👨‍🎨', '👩‍🎨', '🦸', '🦹', '🧙',
  '🐱', '🐶', '🦊', '🐼', '🐯', '🦁', '🐸', '🐵'
];

function AvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div className="avatar-selector">
      <h3>Choose Your Avatar</h3>
      <div className="avatar-grid">
        {avatars.map(avatar => (
          <div
            key={avatar}
            className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
            onClick={() => onSelect(avatar)}
          >
            {avatar}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AvatarSelector;

