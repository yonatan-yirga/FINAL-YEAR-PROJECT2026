/**
 * SkillsInput Component
 * Custom tag/chips input for skills
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './SkillsInput.css';

const SkillsInput = ({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Enter skills (comma-separated)',
  maxSkills = 20,
  error = null,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  
  // Parse current skills from string value
  const skills = value
    ? value.split(',').map(s => s.trim()).filter(s => s)
    : [];
  
  /**
   * Add skill to list
   */
  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    
    // Validation
    if (!trimmedSkill) return;
    if (skills.includes(trimmedSkill)) {
      alert('Skill already added');
      return;
    }
    if (skills.length >= maxSkills) {
      alert(`Maximum ${maxSkills} skills allowed`);
      return;
    }
    
    // Add skill
    const newSkills = [...skills, trimmedSkill];
    onChange(newSkills.join(', '));
    setInputValue('');
  };
  
  /**
   * Remove skill from list
   */
  const removeSkill = (skillToRemove) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    onChange(newSkills.join(', '));
  };
  
  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Check for comma
    if (value.includes(',')) {
      const skillsToAdd = value.split(',').map(s => s.trim()).filter(s => s);
      skillsToAdd.forEach(skill => addSkill(skill));
      setInputValue('');
    } else {
      setInputValue(value);
    }
  };
  
  /**
   * Handle key press
   */
  const handleKeyDown = (e) => {
    // Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
    }
    
    // Backspace on empty input
    if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };
  
  /**
   * Handle blur
   */
  const handleBlur = () => {
    // Add pending input as skill
    if (inputValue.trim()) {
      addSkill(inputValue);
    }
    if (onBlur) {
      onBlur();
    }
  };
  
  /**
   * Focus input when container is clicked
   */
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div className="skills-input-wrapper">
      <div
        className={`skills-input-container ${error ? 'error' : ''}`}
        onClick={handleContainerClick}
      >
        {/* Skills Tags */}
        {skills.map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
            <button
              type="button"
              className="skill-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill);
              }}
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          className="skills-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={skills.length === 0 ? placeholder : ''}
          disabled={skills.length >= maxSkills}
        />
      </div>
      
      {/* Helper Text */}
      <div className="skills-input-helper">
        <span className="skills-count">
          {skills.length} / {maxSkills} skills
        </span>
        <span className="skills-hint">
          Press Enter or comma to add skill
        </span>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="skills-input-error">
          {error}
        </div>
      )}
    </div>
  );
};

SkillsInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  maxSkills: PropTypes.number,
  error: PropTypes.string,
};

export default SkillsInput;