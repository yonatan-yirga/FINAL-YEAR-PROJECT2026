"""
Recommendation Engine
TF-IDF + Cosine Similarity for internship matching
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class RecommendationEngine:
    """
    Content-based recommendation engine using TF-IDF and Cosine Similarity
    
    Matches student skills with internship required skills to provide ranked recommendations
    """
    
    def __init__(self):
        """Initialize the TF-IDF vectorizer"""
        self.vectorizer = TfidfVectorizer(
            max_features=100,           # Limit vocabulary size
            stop_words='english',       # Remove common English words
            ngram_range=(1, 2),         # Use unigrams and bigrams
            lowercase=True,             # Normalize to lowercase
            token_pattern=r'\b\w+\b'    # Word tokenization
        )
    
    def get_recommendations(self, student_skills, internships):
        """
        Calculate match percentage between student skills and internships
        
        Args:
            student_skills (str): Comma-separated skills (e.g., "Python, Django, React")
            internships (QuerySet): Available internships to match against
        
        Returns:
            list: List of (internship, match_percentage) tuples, sorted by match % (highest first)
        
        Example:
            >>> engine = RecommendationEngine()
            >>> recommendations = engine.get_recommendations(
            ...     "Python, Django, REST API",
            ...     Internship.objects.filter(status='OPEN')
            ... )
            >>> for internship, match in recommendations[:5]:
            ...     print(f"{internship.title}: {match}%")
        """
        # Handle empty cases
        if not internships or not internships.exists():
            return []
        
        if not student_skills or not student_skills.strip():
            # If student has no skills, return all internships with 0% match
            return [(internship, 0.0) for internship in internships]
        
        try:
            # Prepare documents
            documents = [student_skills]  # First document is student's skills
            
            # Add each internship's required skills
            for internship in internships:
                # Get required skills, default to empty string if missing
                skills = getattr(internship, 'required_skills', '') or ''
                documents.append(skills)
            
            # Calculate TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            
            # Extract student vector (first row)
            student_vector = tfidf_matrix[0:1]
            
            # Extract internship vectors (remaining rows)
            internship_vectors = tfidf_matrix[1:]
            
            # Calculate cosine similarity between student and each internship
            similarities = cosine_similarity(student_vector, internship_vectors)[0]
            
            # Create results list with match percentages
            results = []
            for idx, internship in enumerate(internships):
                # Convert similarity (0-1) to percentage (0-100)
                match_percentage = round(float(similarities[idx]) * 100, 2)
                results.append((internship, match_percentage))
            
            # Sort by match percentage (highest first)
            results.sort(key=lambda x: x[1], reverse=True)
            
            return results
        
        except Exception as e:
            # If recommendation fails, return all internships with 0% match
            # This ensures the system doesn't break if TF-IDF fails
            print(f"Recommendation engine error: {e}")
            return [(internship, 0.0) for internship in internships]
    
    def get_top_recommendations(self, student_skills, internships, top_n=10):
        """
        Get top N recommendations
        
        Args:
            student_skills (str): Student's skills
            internships (QuerySet): Available internships
            top_n (int): Number of top recommendations to return
        
        Returns:
            list: Top N (internship, match_percentage) tuples
        """
        all_recommendations = self.get_recommendations(student_skills, internships)
        return all_recommendations[:top_n]
    
    def explain_match(self, student_skills, internship_skills):
        """
        Explain why an internship matches (for debugging/transparency)
        
        Args:
            student_skills (str): Student's skills
            internship_skills (str): Internship's required skills
        
        Returns:
            dict: Match explanation with common skills
        """
        try:
            # Split skills into lists
            student_skills_list = set(s.strip().lower() for s in student_skills.split(',') if s.strip())
            internship_skills_list = set(s.strip().lower() for s in internship_skills.split(',') if s.strip())
            
            # Find common skills
            common_skills = student_skills_list.intersection(internship_skills_list)
            
            # Find missing skills
            missing_skills = internship_skills_list - student_skills_list
            
            # Calculate simple match percentage
            if len(internship_skills_list) > 0:
                simple_match = (len(common_skills) / len(internship_skills_list)) * 100
            else:
                simple_match = 0
            
            return {
                'common_skills': list(common_skills),
                'missing_skills': list(missing_skills),
                'student_skills_count': len(student_skills_list),
                'required_skills_count': len(internship_skills_list),
                'common_count': len(common_skills),
                'simple_match_percentage': round(simple_match, 2),
            }
        
        except Exception as e:
            return {
                'error': str(e),
                'common_skills': [],
                'missing_skills': [],
            }


# Singleton instance for reuse
_recommendation_engine = None

def get_recommendation_engine():
    """
    Get or create the recommendation engine instance
    
    Returns:
        RecommendationEngine: Singleton engine instance
    """
    global _recommendation_engine
    if _recommendation_engine is None:
        _recommendation_engine = RecommendationEngine()
    return _recommendation_engine