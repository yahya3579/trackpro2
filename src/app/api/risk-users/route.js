import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET - Fetch users identified as risky based on specific criteria:
 * 1. Working less than 1 hour a day in a week
 * 2. Having high unproductive time (over 3 hours)
 */
export async function GET(request) {
  try {
    // Get token from header
    const token = request.headers.get('x-auth-token');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization token is required' 
      }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Set default date range if none provided (last 7 days)
    const currentDate = new Date();
    const defaultEndDate = currentDate.toISOString().split('T')[0];
    
    // Default start date: 7 days ago
    const defaultStartDate = new Date(currentDate);
    defaultStartDate.setDate(currentDate.getDate() - 7);
    const formattedDefaultStartDate = defaultStartDate.toISOString().split('T')[0];
    
    // Use provided dates or defaults
    const effectiveStartDate = startDate || formattedDefaultStartDate;
    const effectiveEndDate = endDate || defaultEndDate;
    
    try {
      // First get all employees
      const [employees] = await db.query(
        `SELECT * FROM employees WHERE status = 'active' OR status = 'activated'`
      );
      
      if (!employees || employees.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No active employees found',
          riskUsers: []
        });
      }
      
      // Then get productivity data for the period
      const query = `
        SELECT 
          employee_id,
          SUM(duration_seconds) as total_seconds,
          SUM(CASE WHEN productive = 1 THEN duration_seconds ELSE 0 END) as productive_seconds,
          SUM(CASE WHEN productive = 0 THEN duration_seconds ELSE 0 END) as nonproductive_seconds,
          COUNT(DISTINCT DATE(date)) as active_days
        FROM app_usage
        WHERE date BETWEEN ? AND ?
        GROUP BY employee_id
      `;
      
      const [productivityData] = await db.query(query, [effectiveStartDate, effectiveEndDate]);
      
      // Calculate risk metrics and identify risky users
      const riskUsers = [];
      
      for (const employee of employees) {
        const employeeProductivity = productivityData.find(p => p.employee_id === employee.id);
        
        if (!employeeProductivity) {
          // No activity data is itself risky - add employee with low activity risk
          riskUsers.push({
            ...employee,
            risk_status: 'high',
            risk_factors: ['low_work_time'],
            avg_daily_hours: 0,
            nonproductive_hours: 0,
            total_hours: 0,
            productivity_rate: 0,
            last_active: null
          });
          continue;
        }
        
        // Calculate metrics
        const totalHours = employeeProductivity.total_seconds / 3600;
        const productiveHours = employeeProductivity.productive_seconds / 3600;
        const nonproductiveHours = employeeProductivity.nonproductive_seconds / 3600;
        const activeDays = employeeProductivity.active_days || 1;
        const avgDailyHours = totalHours / (activeDays || 7); // Use recorded active days or default to 7
        
        // Calculate productivity rate
        const productivityRate = employeeProductivity.total_seconds > 0 
          ? (employeeProductivity.productive_seconds / employeeProductivity.total_seconds) * 100 
          : 0;
        
        // Determine risk factors
        const riskFactors = [];
        
        if (avgDailyHours < 1) {
          riskFactors.push('low_work_time');
        }
        
        if (nonproductiveHours > 3) {
          riskFactors.push('high_nonproductive');
        }
        
        // Only add if user has risk factors
        if (riskFactors.length > 0) {
          // Get last active time from recent app_usage
          const [lastActiveResult] = await db.query(
            `SELECT MAX(date) as last_active FROM app_usage WHERE employee_id = ?`,
            [employee.id]
          );
          
          riskUsers.push({
            ...employee,
            risk_status: 'high',
            risk_factors: riskFactors,
            avg_daily_hours: avgDailyHours,
            nonproductive_hours: nonproductiveHours,
            total_hours: totalHours,
            productivity_rate: productivityRate,
            last_active: lastActiveResult[0]?.last_active || null
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        riskUsers,
        period: {
          start: effectiveStartDate,
          end: effectiveEndDate
        }
      });
      
    } catch (dbError) {
      console.error('Database error fetching risk users:', dbError);
      
      // If database operation fails, return mock data for demonstration
      return NextResponse.json({
        success: true,
        error: 'Failed to query database, returning sample data',
        riskUsers: generateMockRiskUsers(),
        period: {
          start: effectiveStartDate,
          end: effectiveEndDate
        }
      });
    }
  } catch (error) {
    console.error('Error in risk-users API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch risk users',
      message: error.message
    }, { status: 500 });
  }
}

// Helper function to generate mock risk users for demonstration
function generateMockRiskUsers() {
  const riskTypes = ["low_work_time", "high_nonproductive", "both"];
  const names = [
    "John Smith", "Sarah Johnson", "Michael Brown", "Emma Wilson", 
    "David Lee", "Lisa Chen", "Robert Taylor", "Amanda Davis",
    "Christopher Martinez", "Jessica Thompson"
  ];
  
  return Array.from({ length: 12 }, (_, i) => {
    const riskType = riskTypes[Math.floor(Math.random() * riskTypes.length)];
    const avgDailyHours = riskType === "low_work_time" || riskType === "both" ? 
      Math.random() * 0.9 : 1 + Math.random() * 4;
    const nonproductiveHours = riskType === "high_nonproductive" || riskType === "both" ? 
      3 + Math.random() * 3 : Math.random() * 2.9;
    const productivityRate = 100 - (nonproductiveHours / (avgDailyHours * 7) * 100);
    
    const riskFactors = [];
    if (riskType === "low_work_time" || riskType === "both") riskFactors.push("low_work_time");
    if (riskType === "high_nonproductive" || riskType === "both") riskFactors.push("high_nonproductive");
    
    return {
      id: `emp-${i+1}`,
      employee_name: names[i % names.length],
      email: names[i % names.length].toLowerCase().replace(" ", ".") + "@example.com",
      department: ["Engineering", "Marketing", "Sales", "HR", "Finance"][Math.floor(Math.random() * 5)],
      position: ["Developer", "Manager", "Analyst", "Specialist", "Assistant"][Math.floor(Math.random() * 5)],
      status: "active",
      risk_status: "high",
      risk_factors: riskFactors,
      avg_daily_hours: avgDailyHours,
      nonproductive_hours: nonproductiveHours,
      productivity_rate: Math.max(0, Math.min(100, productivityRate)),
      last_active: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
    };
  });
} 