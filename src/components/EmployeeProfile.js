import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaHistory, 
  FaDollarSign, 
  FaStar, 
  FaGraduationCap, 
  FaChartLine,
  FaTrophy,
  FaCheckCircle,
  FaTimesCircle,
  FaBullseye 
} from 'react-icons/fa';
import '../styles/EmployeeProfile.css';
import PositionFormModal from './PositionFormModal';
import CompensationFormModal from './CompensationFormModal';
import SkillFormModal from './SkillFormModal';

// Import tab components (placeholders - you can implement these later)
const PersonalInfoTab = ({ employee }) => (
  <div className="personal-info-tab">
    <h3>Personal Information</h3>
    <div className="info-grid">
      <div className="info-group">
        <label>Full Name</label>
        <div>{employee.firstName} {employee.lastName}</div>
      </div>
      <div className="info-group">
        <label>Email</label>
        <div>{employee.email}</div>
      </div>
      <div className="info-group">
        <label>Username</label>
        <div>{employee.username}</div>
      </div>
      <div className="info-group">
        <label>Date of Birth</label>
        <div>{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
      </div>
      <div className="info-group">
        <label>Gender</label>
        <div>{employee.gender || 'Not provided'}</div>
      </div>
      <div className="info-group">
        <label>Contact Number</label>
        <div>{employee.contactNumber || 'Not provided'}</div>
      </div>
      <div className="info-group">
        <label>Address</label>
        <div>{employee.address || 'Not provided'}</div>
      </div>
      <div className="info-group">
        <label>Employment Type</label>
        <div>{employee.employmentType || 'Not provided'}</div>
      </div>
      <div className="info-group">
        <label>Hire Date</label>
        <div>{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'Not provided'}</div>
      </div>
    </div>
  </div>
);

const PositionHistoryTab = ({ employeeId, departments }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/positions/employee/${employeeId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch position history');
        
        const data = await response.json();
        setPositions(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    if (employeeId) fetchPositions();
  }, [employeeId, API_BASE_URL]);
  
  const handleSavePosition = async (positionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/positions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(positionData)
      });
      
      if (!response.ok) throw new Error('Failed to add position');
      
      const newPosition = await response.json();
      
      // Update the positions list with the new position
      setPositions([...positions, newPosition]);
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };
  
  if (loading) return <div>Loading position history...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <div className="position-history-tab">
      <div className="tab-header">
        <h3>Position History</h3>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>Add Position</button>
      </div>
      
      {positions.length === 0 ? (
        <div className="empty-state">No position history records found</div>
      ) : (
        <div className="timeline">
          {positions.map((position, index) => (
            <div key={position._id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>{position.title}</h4>
                <div className="timeline-period">
                  {new Date(position.startDate).toLocaleDateString()} - 
                  {position.endDate ? new Date(position.endDate).toLocaleDateString() : 'Present'}
                </div>
                <div className="timeline-department">{position.department}</div>
                <div className="timeline-reason">
                  <strong>Reason for Change:</strong> {position.changeReason}
                </div>
                {position.responsibilities && (
                  <div className="timeline-responsibilities">{position.responsibilities}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <PositionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePosition}
        employeeId={employeeId}
        departments={departments}
      />
    </div>
  );
};

const CompensationTab = ({ employeeId }) => {
    const [compensation, setCompensation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const API_BASE_URL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://performance-review-backend-ab8z.onrender.com';
    
    useEffect(() => {
      const fetchCompensation = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/api/compensation/employee/${employeeId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) throw new Error('Failed to fetch compensation history');
          
          const data = await response.json();
          setCompensation(data);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };
      
      if (employeeId) fetchCompensation();
    }, [employeeId, API_BASE_URL]);
  
    const handleSaveCompensation = async (compensationData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/compensation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(compensationData)
        });
        
        if (!response.ok) throw new Error('Failed to add compensation record');
        
        const newCompensation = await response.json();
        
        // Update the compensation list with the new record
        setCompensation([...compensation, newCompensation]);
        setIsModalOpen(false);
      } catch (error) {
        setError(error.message);
      }
    };
    
    if (loading) return <div>Loading compensation history...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    
    // Format currency
    const formatCurrency = (amount, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    };
    
    return (
      <div className="compensation-tab">
        <div className="tab-header">
          <h3>Compensation History</h3>
          <button className="add-button" onClick={() => setIsModalOpen(true)}>
            Add Compensation
          </button>
        </div>
        
        {compensation.length === 0 ? (
          <div className="empty-state">No compensation records found</div>
        ) : (
          <div className="compensation-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Effective Date</th>
                  <th>Salary</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Approved By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {compensation.map(record => (
                  <tr key={record._id}>
                    <td>{new Date(record.effectiveDate).toLocaleDateString()}</td>
                    <td>{formatCurrency(record.salary, record.currency)}</td>
                    <td>{record.salaryType}</td>
                    <td>{record.reason}</td>
                    <td>
                      {record.approvedBy ? 
                        `${record.approvedBy.firstName} ${record.approvedBy.lastName}` :
                        'N/A'}
                    </td>
                    <td>{record.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <CompensationFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCompensation}
          employeeId={employeeId}
        />
      </div>
    );
  };

const ReviewsTab = ({ employeeId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/reviews/employee/${employeeId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch reviews');
        
        const data = await response.json();
        setReviews(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    if (employeeId) fetchReviews();
  }, [employeeId, API_BASE_URL]);
  
  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Draft': return 'badge badge-draft';
      case 'Submitted': return 'badge badge-submitted';
      case 'InProgress': return 'badge badge-inprogress';
      case 'Completed': return 'badge badge-completed';
      case 'Acknowledged': return 'badge badge-acknowledged';
      default: return 'badge';
    }
  };
  
  return (
    <div className="reviews-tab">
      <div className="tab-header">
        <h3>Performance Reviews</h3>
        <button className="add-button">New Review</button>
      </div>
      
      {reviews.length === 0 ? (
        <div className="empty-state">No reviews found</div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                <h4>{review.reviewType} Review</h4>
                <span className={getStatusBadgeClass(review.status)}>
                  {review.status}
                </span>
              </div>
              
              <div className="review-card-content">
                <div className="review-meta">
                  <div className="review-period">
                    <strong>Period:</strong> {new Date(review.reviewPeriod.start).toLocaleDateString()} to {new Date(review.reviewPeriod.end).toLocaleDateString()}
                  </div>
                  <div className="review-reviewer">
                    <strong>Reviewer:</strong> {review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'N/A'}
                  </div>
                  <div className="review-date">
                    <strong>Submitted:</strong> {new Date(review.submissionDate).toLocaleDateString()}
                  </div>
                </div>
                
                {review.ratings && review.ratings.overallRating && (
                  <div className="review-rating">
                    <strong>Overall Rating:</strong>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          className={star <= review.ratings.overallRating ? 'star filled' : 'star'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="review-buttons">
                  <button className="view-button">View Details</button>
                  {review.status === 'Completed' && !review.acknowledgement?.acknowledged && (
                    <button className="acknowledge-button">Acknowledge</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SkillsTab = ({ employee }) => {
    const [skills, setSkills] = useState(employee.skills || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const API_BASE_URL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://performance-review-backend-ab8z.onrender.com';
  
    const handleSaveSkill = async (skillData) => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/employees/${employee._id}/skills`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(skillData)
        });
        
        if (!response.ok) throw new Error('Failed to add skill');
        
        const updatedEmployee = await response.json();
        
        // Update skills from the returned employee object
        setSkills(updatedEmployee.skills || []);
        setIsModalOpen(false);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
  
    // Render proficiency level as stars
    const renderProficiencyStars = (level) => {
      return [1, 2, 3, 4, 5].map(star => (
        <span 
          key={star} 
          className={star <= level ? 'star filled' : 'star'}
        >
          ★
        </span>
      ));
    };
    
    return (
      <div className="skills-tab">
        <div className="tab-header">
          <h3>Skills & Development</h3>
          <button 
            className="add-button" 
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
          >
            Add Skill
          </button>
        </div>
        
        {loading && <div>Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
        
        {skills.length === 0 ? (
          <div className="empty-state">No skills recorded</div>
        ) : (
          <div className="skills-list">
            {skills.map((skill, index) => (
              <div key={index} className="skill-card">
                <div className="skill-header">
                  <h4>{skill.name}</h4>
                  <div className="skill-proficiency">
                    {renderProficiencyStars(skill.proficiencyLevel)}
                  </div>
                </div>
                <div className="skill-details">
                  <div className="skill-meta">
                    <span>Years of Experience: {skill.yearsOfExperience || 'N/A'}</span>
                    <span>Last Used: {skill.lastUsed ? new Date(skill.lastUsed).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {skill.notes && (
                    <div className="skill-notes">
                      <strong>Notes:</strong> {skill.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <SkillFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSkill}
          employeeId={employee._id}
        />
      </div>
    );
  };

  const PerformanceMetricCard = ({ icon, title, value, trend }) => (
    <div className="performance-metric-card">
      <div className="metric-header">
        {icon}
        <h4>{title}</h4>
      </div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        {trend && (
          <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
  
  // Performance Tab component (with full implementation)
  const PerformanceTab = ({ employeeId }) => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const API_BASE_URL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://performance-review-backend-ab8z.onrender.com';
  
    useEffect(() => {
      const fetchPerformanceData = async () => {
        try {
          console.log('Fetching performance data for employeeId:', employeeId);
          console.log('API Base URL:', API_BASE_URL);
          
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/api/performance/${employeeId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          });
  
          console.log('Response status:', response.status);
  
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch performance data:', errorText);
            throw new Error(`Failed to fetch performance data: ${errorText}`);
          }
  
          const data = await response.json();
          console.log('Fetched performance data:', data);
          
          setPerformanceData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching performance data:', error);
          setError(error.message);
          setLoading(false);
        }
      };
  
      if (employeeId) fetchPerformanceData();
    }, [employeeId, API_BASE_URL]);
  
    // Fallback data for demonstration
    const fallbackData = {
        overallRating: 4.2,
        reviewCount: 3,
        goalCompletionRate: 85,
        recentAchievements: [
          { title: "Demonstrated Strong Communication Skills", date: "2025-03-31" },
          { title: "Contributed to Team Project Success", date: "2025-02-15" }
        ],
        skillGrowth: [
          { skill: "Customer Success", level: 4, trend: 20 },
          { skill: "Sales Strategies", level: 3, trend: 15 }
        ]
      };
    
      if (loading) {
        return <div className="loading">Loading performance metrics...</div>;
      }
    
      if (error) {
        return (
          <div className="performance-error">
            <p>Error loading performance data:</p>
            <p>{error}</p>
            <p>Using sample data for demonstration</p>
          </div>
        );
      }
  
    // Use fetched data or fallback data
    const data = performanceData || fallbackData;

  return (
    <div className="performance-tab">
      <div className="performance-overview">
        <div className="performance-metrics-grid">
          <PerformanceMetricCard 
            icon={<FaTrophy />}
            title="Overall Performance Rating"
            value={(data.overallRating || 0).toFixed(1)}
            trend={5}
          />
          <PerformanceMetricCard 
            icon={<FaCheckCircle />}
            title="Goal Completion Rate"
            value={`${data.goalCompletionRate || 0}%`}
            trend={10}
          />
          <PerformanceMetricCard 
            icon={<FaTimesCircle />}
            title="Total Reviews"
            value={data.reviewCount || 0}
          />
        </div>

        <div className="performance-sections">
          <div className="achievements-section">
            <h3>Recent Achievements</h3>
            {(data.recentAchievements || []).map((achievement, index) => (
              <div key={index} className="achievement-card">
                <FaBullseye className="achievement-icon" />
                <div>
                  <h4>{achievement.title}</h4>
                  <p>Achieved on {new Date(achievement.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="skill-growth-section">
            <h3>Skill Growth Trajectory</h3>
            {(data.skillGrowth || []).map((skillData, index) => (
              <div key={index} className="skill-growth-card">
                <div className="skill-info">
                  <span>{skillData.skill}</span>
                  <span className={`skill-level level-${skillData.level}`}>
                    Level {skillData.level}/5
                  </span>
                </div>
                <div className={`skill-trend ${skillData.trend > 0 ? 'positive' : 'negative'}`}>
                  {skillData.trend > 0 ? '▲' : '▼'} {Math.abs(skillData.trend)}% Growth
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Define the API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // Explicit local server URL
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employee data
        const employeeResponse = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!employeeResponse.ok) {
          throw new Error('Failed to fetch employee data');
        }
        
        const employeeData = await employeeResponse.json();
        setEmployee(employeeData);
        
        // Fetch departments for dropdown options
        const departmentsResponse = await fetch(`${API_BASE_URL}/api/departments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData);
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, API_BASE_URL]);
  
  if (loading) {
    return <div className="loading">Loading employee data...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  if (!employee) {
    return <div className="error">Employee not found</div>;
  }
  
  return (
    <div className="employee-profile">
      <div className="profile-header">
        <div className="profile-overview">
          <div className="profile-image">
            <div className="profile-initials">
              {`${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`}
            </div>
          </div>
          <div className="profile-details">
            <h1>{employee.firstName} {employee.lastName}</h1>
            <p className="job-title">{employee.title || employee.jobTitle || 'No Job Title'}</p>
            <p className="department">{employee.department}</p>
            <div className="profile-meta">
              <span className="meta-item">
                <strong>Email:</strong> {employee.email}
              </span>
              <span className="meta-item">
                <strong>Role:</strong> {employee.role}
              </span>
              <span className="meta-item">
                <strong>Status:</strong> {employee.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <Link to="/employees" className="back-button">Back to Employees</Link>
        </div>
      </div>
      
      <div className="profile-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <FaUser /> Personal
          </button>
          <button 
            className={`tab-button ${activeTab === 'positions' ? 'active' : ''}`}
            onClick={() => setActiveTab('positions')}
          >
            <FaHistory /> Position History
          </button>
          <button 
            className={`tab-button ${activeTab === 'compensation' ? 'active' : ''}`}
            onClick={() => setActiveTab('compensation')}
          >
            <FaDollarSign /> Compensation
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FaStar /> Reviews
          </button>
          <button 
            className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <FaGraduationCap /> Skills & Development
          </button>
          <button 
            className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <FaChartLine /> Performance
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'personal' && <PersonalInfoTab employee={employee} />}
          {activeTab === 'positions' && <PositionHistoryTab employeeId={employee._id} departments={departments} />}
          {activeTab === 'compensation' && <CompensationTab employeeId={employee._id} />}
          {activeTab === 'reviews' && <ReviewsTab employeeId={employee._id} />}
          {activeTab === 'skills' && <SkillsTab employee={employee} />}
          {activeTab === 'performance' && <PerformanceTab employeeId={employee._id} />}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;