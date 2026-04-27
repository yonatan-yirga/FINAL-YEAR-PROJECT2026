/**
 * SkillMatcher Component
 * Visual display of skill matching between student and internship
 */
import React from 'react';
import PropTypes from 'prop-types';
import './SkillMatcher.css';

const SkillMatcher = ({ 
  studentSkills = '', 
  requiredSkills = '',
  showPercentage = true 
}) => {
  /**
   * Parse and compare skills
   */
  const parseSkills = () => {
    const studentSkillsArray = studentSkills
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s);
    
    const requiredSkillsArray = requiredSkills
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
    
    const matchedSkills = [];
    const missingSkills = [];
    
    requiredSkillsArray.forEach(skill => {
      if (studentSkillsArray.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });
    
    const matchPercentage = requiredSkillsArray.length > 0
      ? Math.round((matchedSkills.length / requiredSkillsArray.length) * 100)
      : 0;
    
    return {
      matched: matchedSkills,
      missing: missingSkills,
      percentage: matchPercentage,
      total: requiredSkillsArray.length,
    };
  };
  
  const { matched, missing, percentage, total } = parseSkills();
  
  /**
   * Get match color
   */
  const getMatchColor = () => {
    if (percentage >= 80) return '#48bb78';
    if (percentage >= 50) return '#f6ad55';
    return '#f56565';
  };
  
  if (total === 0) {
    return (
      <div className="skill-matcher">
        <div className="no-skills">
          <p>No required skills specified</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="skill-matcher">
      {/* Match Summary */}
      {showPercentage && (
        <div className="match-summary">
          <div className="match-bar-container">
            <div 
              className="match-bar-fill"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: getMatchColor()
              }}
            />
          </div>
          <div className="match-stats">
            <span className="match-percentage" style={{ color: getMatchColor() }}>
              {percentage}% Match
            </span>
            <span className="match-count">
              {matched.length} of {total} skills
            </span>
          </div>
        </div>
      )}
      
      {/* Matched Skills */}
      {matched.length > 0 && (
        <div className="skills-section">
          <h4 className="skills-section-title">
            <svg className="icon-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            You Have ({matched.length})
          </h4>
          <div className="skills-list">
            {matched.map((skill, index) => (
              <span key={index} className="skill-badge skill-matched">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Missing Skills */}
      {missing.length > 0 && (
        <div className="skills-section">
          <h4 className="skills-section-title">
            <svg className="icon-x" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Missing ({missing.length})
          </h4>
          <div className="skills-list">
            {missing.map((skill, index) => (
              <span key={index} className="skill-badge skill-missing">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Perfect Match Message */}
      {matched.length === total && total > 0 && (
        <div className="perfect-match">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Perfect match! You have all required skills.
        </div>
      )}
    </div>
  );
};

SkillMatcher.propTypes = {
  studentSkills: PropTypes.string,
  requiredSkills: PropTypes.string,
  showPercentage: PropTypes.bool,
};

export default SkillMatcher;