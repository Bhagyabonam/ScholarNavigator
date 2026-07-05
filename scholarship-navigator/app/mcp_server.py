import logging
import sys
from typing import Any, Optional
from mcp.server.fastmcp import FastMCP

# Setup logging to stderr because stdout is reserved for MCP JSON-RPC stdio communication
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger("scholarship_mcp_server")

# Initialize FastMCP Server
mcp = FastMCP("ScholarshipNavigatorMCP")

# Mock scholarship database
SCHOLARSHIP_DB = [
    {
        "name": "Academic Excellence Scholarship",
        "amount": "$10,000",
        "degree": "Undergraduate",
        "branch": "Computer Science",
        "min_gpa": 3.5,
        "max_income": 100000,
        "deadline": "2026-10-15",
        "required_documents": ["Official Transcript", "2 recommendation letters", "Statement of Purpose"],
        "description": "Awarded to undergraduate students with outstanding academic records in Computer Science and Engineering."
    },
    {
        "name": "Global Access Education Fund",
        "amount": "$5,000",
        "degree": "Undergraduate",
        "branch": "Any",
        "min_gpa": 3.0,
        "max_income": 50000,
        "deadline": "2026-11-01",
        "required_documents": ["Income certificate", "Statement of Purpose", "1 letter of recommendation"],
        "description": "Supports undergraduate students from low-income families globally to pursue higher education."
    },
    {
        "name": "STEM Innovators Fellowship",
        "amount": "$15,000",
        "degree": "Graduate",
        "branch": "Science/Technology/Engineering/Math",
        "min_gpa": 3.7,
        "max_income": 150000,
        "deadline": "2026-12-05",
        "required_documents": ["Research proposal", "CV/Resume", "3 recommendation letters", "Transcripts"],
        "description": "Targeted at graduate students embarking on innovative research projects in STEM disciplines."
    },
    {
        "name": "Women in Tech Empowerment Grant",
        "amount": "$8,000",
        "degree": "Undergraduate",
        "branch": "Information Technology",
        "min_gpa": 3.2,
        "max_income": 120000,
        "deadline": "2026-09-30",
        "required_documents": ["Essay of Impact", "Resume", "1 letter of recommendation"],
        "description": "Empowering women pursuing careers in IT and Software Engineering through direct educational funding."
    }
]

@mcp.tool()
def search_scholarships(query: str, degree: Optional[str] = None, branch: Optional[str] = None) -> list[dict[str, Any]]:
    """Searches the scholarship database matching keyword queries, degree level, and branch/major.
    
    Args:
        query: Search term or keyword (e.g. 'excellence', 'women', 'STEM').
        degree: Optional degree level filter ('Undergraduate' or 'Graduate').
        branch: Optional academic major/branch (e.g. 'Computer Science', 'IT').
    """
    logger.info(f"Received search query: '{query}', degree: '{degree}', branch: '{branch}'")
    results = []
    
    query_lower = query.lower()
    for item in SCHOLARSHIP_DB:
        # Match keywords in title, description, or branch
        match_query = (
            query_lower in item["name"].lower() or 
            query_lower in item["description"].lower() or 
            query_lower in item["branch"].lower()
        )
        
        # Match degree filter if specified
        match_degree = True
        if degree and item["degree"] != "Any":
            match_degree = degree.lower() in item["degree"].lower()
            
        # Match branch filter if specified
        match_branch = True
        if branch and item["branch"] != "Any":
            match_branch = branch.lower() in item["branch"].lower() or item["branch"].lower() == "any"
            
        if match_query or (degree and match_degree) or (branch and match_branch):
            results.append(item)
            
    return results

@mcp.tool()
def get_scholarship_details(scholarship_name: str) -> dict[str, Any]:
    """Retrieves full information for a specific scholarship, including eligibility and required documents.
    
    Args:
        scholarship_name: The exact name of the scholarship.
    """
    logger.info(f"Retrieving details for scholarship: '{scholarship_name}'")
    for item in SCHOLARSHIP_DB:
        if item["name"].lower() == scholarship_name.lower():
            return item
    return {"error": f"Scholarship '{scholarship_name}' not found in database."}

@mcp.tool()
def get_application_deadlines(scholarship_name: str) -> dict[str, str]:
    """Provides application deadlines and countdown info for a scholarship.
    
    Args:
        scholarship_name: The exact name of the scholarship.
    """
    logger.info(f"Retrieving deadline information for scholarship: '{scholarship_name}'")
    for item in SCHOLARSHIP_DB:
        if item["name"].lower() == scholarship_name.lower():
            return {
                "scholarship_name": item["name"],
                "deadline_date": item["deadline"],
                "status": f"Open. Applications must be submitted by {item['deadline']}."
            }
    return {"error": f"Scholarship '{scholarship_name}' not found."}

if __name__ == "__main__":
    logger.info("Starting Scholarship Navigator MCP Server...")
    mcp.run()
