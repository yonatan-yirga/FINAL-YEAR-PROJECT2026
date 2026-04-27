/**
 * Public Service
 * API service for public (unauthenticated) data access
 * Used for landing page and public company profiles
 */
import apiService from './api';

const publicService = {
  /**
   * Get public list of companies with active internships
   * No authentication required
   * @returns {Promise} List of companies
   */
  getPublicCompanies: async () => {
    try {
      console.log('Fetching public companies...');
      
      // Fetch all open internships from public endpoint (no auth required)
      const response = await apiService.get('/internships/public/', { 
        params: { 
          ordering: '-created_at'
        } 
      });
      
      console.log('Public internships response:', response);
      
      if (!response || !Array.isArray(response)) {
        console.error('Invalid response format:', response);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      
      // Group internships by company
      const companiesMap = new Map();
      
      response.forEach(internship => {
        const companyName = internship.company_name;
        if (!companyName) {
          console.warn('Internship missing company_name:', internship);
          return;
        }
        
        if (!companiesMap.has(companyName)) {
          companiesMap.set(companyName, {
            id: internship.id, // Use first internship ID as company identifier
            name: companyName,
            logo: '🏢', // Default logo
            description: `Leading company offering quality internship opportunities in ${internship.location || 'various locations'}.`,
            location: internship.location || 'Ethiopia',
            internships: 0,
            rating: 4.5 + Math.random() * 0.5, // Mock rating 4.5-5.0
            active_internships: []
          });
        }
        
        const company = companiesMap.get(companyName);
        company.internships++;
        company.active_internships.push(internship);
      });
      
      // Convert map to array and limit to 6 companies for landing page
      const companies = Array.from(companiesMap.values())
        .sort((a, b) => b.internships - a.internships)
        .slice(0, 6);
      
      console.log('Processed companies:', companies);
      
      return {
        success: true,
        data: companies,
      };
    } catch (error) {
      console.error('Error fetching public companies:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch companies',
      };
    }
  },

  /**
   * Get public company details with internships
   * No authentication required
   * @param {string} companyName - Company name
   * @returns {Promise} Company details with internships
   */
  getPublicCompanyByName: async (companyName) => {
    try {
      console.log('Fetching internships for company:', companyName);
      
      // Fetch all open internships from public endpoint
      const response = await apiService.get('/internships/public/', { 
        params: { 
          ordering: '-created_at'
        } 
      });
      
      console.log('Public internships response:', response);
      
      if (!response || !Array.isArray(response)) {
        console.error('Invalid response format:', response);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      
      // Filter internships for this company
      const companyInternships = response.filter(
        internship => internship.company_name === companyName
      );
      
      console.log('Filtered internships for company:', companyInternships);
      
      if (companyInternships.length === 0) {
        return {
          success: false,
          error: 'Company not found or has no active internships',
        };
      }
      
      // Build company profile from internships data
      const firstInternship = companyInternships[0];
      const company = {
        id: companyName, // Use company name as ID
        name: companyName,
        logo: '🏢',
        description: `Leading company specializing in professional development and internship opportunities. We work with Debre Markos University to provide meaningful experiences for students.`,
        location: firstInternship.location || 'Ethiopia',
        address: firstInternship.company_address || 'Addis Ababa, Ethiopia',
        email: firstInternship.company_email || 'info@company.et',
        phone: firstInternship.company_phone || '+251-11-XXX-XXXX',
        website: 'www.company.et',
        founded: '2015',
        employees: '50-100',
        industry: 'Various Industries',
        rating: 4.5 + Math.random() * 0.5,
        total_internships: companyInternships.length,
        active_internships: companyInternships.length,
        completed_internships: Math.floor(companyInternships.length * 3), // Mock
        success_rate: 90 + Math.floor(Math.random() * 10), // Mock 90-99%
      };
      
      return {
        success: true,
        data: {
          company,
          internships: companyInternships,
        },
      };
    } catch (error) {
      console.error('Error fetching company details:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch company details',
      };
    }
  },

  /**
   * Get public statistics for landing page
   * No authentication required
   * @returns {Promise} System statistics
   */
  getPublicStats: async () => {
    try {
      // Fetch open internships from public endpoint to calculate stats
      const response = await apiService.get('/internships/public/');
      
      // Calculate stats from internships
      const internships = response || [];
      const uniqueCompanies = new Set(internships.map(i => i.company_name)).size;
      
      return {
        success: true,
        data: {
          students: 500, // Mock - TODO: Get from backend
          companies: uniqueCompanies || 50,
          internships: internships.length || 200,
          success_rate: 95, // Mock - TODO: Calculate from backend
        },
      };
    } catch (error) {
      console.error('Error fetching public stats:', error);
      return {
        success: false,
        error: error.response?.data || 'Failed to fetch statistics',
      };
    }
  },
};

export default publicService;
