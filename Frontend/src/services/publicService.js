/**
 * Public Service
 * API service for public (unauthenticated) data access
 * Used for landing page and public company profiles
 */
import apiService, { API_URL } from './api';

const publicService = {
  /**
   * Get public list of internships
   * No authentication required
   * @returns {Promise} List of internships
   */
  getPublicInternships: async () => {
    try {
      console.log('Fetching public internships...');
      
      const response = await fetch(`${API_URL}/internships/public/?ordering=-created_at`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Public internships response:', data);
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid response format:', data);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error fetching public internships:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch internships',
      };
    }
  },

  /**
   * Get public list of companies with active internships
   * No authentication required
   * @returns {Promise} List of companies
   */
  getPublicCompanies: async () => {
    try {
      console.log('=== publicService: getPublicCompanies started ===');
      
      // Add cache-busting timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      const url = `${API_URL}/internships/public/?ordering=-created_at&_t=${timestamp}`;
      
      console.log(`=== publicService: Fetching from: ${url} ===`);
      
      // Fetch all open internships from public endpoint (no auth required)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable browser caching
      });
      
      console.log(`=== publicService: Response status: ${response.status} ${response.statusText} ===`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`=== publicService: HTTP error! status: ${response.status}, body: ${errorText} ===`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('=== publicService: Data received ===', data);
      
      if (!data || !Array.isArray(data)) {
        console.error('=== publicService: Invalid response format, expected array ===', data);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      
      console.log(`=== publicService: Processing ${data.length} internships ===`);
      
      // Group internships by company
      const companiesMap = new Map();
      
      data.forEach((internship, index) => {
        const companyName = internship.company_name;
        
        if (!companyName) {
          console.warn(`=== publicService: Internship ${index} missing company_name ===`, internship);
          return;
        }
        
        if (!companiesMap.has(companyName)) {
          companiesMap.set(companyName, {
            id: internship.company, // Use actual company ID, not internship ID
            name: companyName,
            logo: internship.company_logo || '🏢', 
            description: internship.company_description || `Leading company offering quality internship opportunities in ${internship.location || 'various locations'}.`,
            location: internship.location || 'Ethiopia',
            internships: 0,
            rating: 4.5 + Math.random() * 0.5, 
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
      
      console.log(`=== publicService: Final processed ${companies.length} companies ===`);
      
      return {
        success: true,
        data: companies,
      };
    } catch (error) {
      console.error('=== publicService: Error fetching public companies ===', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch companies',
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
      
      const response = await fetch(`${API_URL}/internships/public/?ordering=-created_at`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Public internships response:', data);
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid response format:', data);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      
      // Filter internships for this company
      const companyInternships = data.filter(
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
        logo: firstInternship.company_logo || '🏢',
        description: firstInternship.company_description || `Leading company specializing in professional development and internship opportunities.`,
        location: firstInternship.location || 'Ethiopia',
        address: firstInternship.company_address || 'Addis Ababa, Ethiopia',
        email: firstInternship.company_email || 'info@company.et',
        phone: firstInternship.company_phone || '+251-11-XXX-XXXX',
        website: firstInternship.company_website || 'www.company.et',
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
      return {
        success: false,
        error: error.message || 'Failed to fetch company details',
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
      const response = await fetch(`${API_URL}/internships/public/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Calculate stats from internships
      const internships = data || [];
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
        error: 'Failed to fetch statistics',
      };
    }
  },
};

export default publicService;
