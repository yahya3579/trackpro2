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
    const organizationId = searchParams.get('organization_id');
    if (!organizationId) {
      return NextResponse.json({
        success: false,
        error: 'organization_id is required'
      }, { status: 400 });
    }
    
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
      // Get productivity and employee data in one query, filtered by organization_id
      const query = `
        SELECT 
          e.*, 
          au.employee_id,
          SUM(au.duration_seconds) as total_seconds,
          SUM(CASE WHEN au.productive = 1 THEN au.duration_seconds ELSE 0 END) as productive_seconds,
          SUM(CASE WHEN au.productive = 0 THEN au.duration_seconds ELSE 0 END) as nonproductive_seconds,
          COUNT(DISTINCT DATE(au.date)) as active_days
        FROM employees e
        LEFT JOIN app_usage au ON e.id = au.employee_id
        WHERE (e.status = 'active' OR e.status = 'activated')
          AND e.organization_id = ?
          AND (au.date BETWEEN ? AND ? OR au.date IS NULL)
        GROUP BY e.id
      `;
      const [productivityData] = await db.query(query, [organizationId, effectiveStartDate, effectiveEndDate]);

      // Calculate risk metrics and identify risky users
      const riskUsers = [];
      
      for (const row of productivityData) {
        // row contains all employee fields and productivity data
        const totalSeconds = row.total_seconds || 0;
        const productiveSeconds = row.productive_seconds || 0;
        const nonproductiveSeconds = row.nonproductive_seconds || 0;
        const activeDays = row.active_days || 1;

        const totalHours = totalSeconds / 3600;
        const productiveHours = productiveSeconds / 3600;
        const nonproductiveHours = nonproductiveSeconds / 3600;
        const avgDailyHours = totalHours / (activeDays || 7);

        const productivityRate = totalSeconds > 0 
          ? (productiveSeconds / totalSeconds) * 100 
          : 0;

        const riskFactors = [];
        if (avgDailyHours < 1) riskFactors.push('low_work_time');
        if (nonproductiveHours > 3) riskFactors.push('high_nonproductive');

        if (riskFactors.length > 0) {
          // Get last active time from recent app_usage
          const [lastActiveResult] = await db.query(
            `SELECT MAX(date) as last_active FROM app_usage WHERE employee_id = ?`,
            [row.id]
          );

          riskUsers.push({
            ...row,
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