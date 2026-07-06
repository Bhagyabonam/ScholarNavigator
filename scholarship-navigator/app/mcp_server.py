# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import sys
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("ScholarNavigatorServer")

# Mock scholarship database
SCHOLARSHIPS_DB = [
    {
        "name": "Global STEM Leaders Scholarship",
        "amount": "$10,000",
        "deadline": "2026-10-15",
        "min_gpa": 3.5,
        "eligible_majors": ["computer science", "engineering", "math", "physics", "science"],
        "requirements": "Statement of purpose (SOP), transcript, 2 recommendation letters, STEM research essay.",
        "description": "Awarded to undergraduate STEM students showing leadership potential and strong academic achievement."
    },
    {
        "name": "Future Innovators Financial Aid",
        "amount": "$5,000",
        "deadline": "2026-11-01",
        "min_gpa": 3.0,
        "eligible_majors": ["any", "business", "arts", "science"],
        "requirements": "Resume, transcript, 1 recommendation letter, brief essay (500 words) on future innovation plans.",
        "description": "Supports students from diverse fields looking to innovate or start businesses in their communities."
    },
    {
        "name": "Community Impact Excellence Award",
        "amount": "$7,500",
        "deadline": "2026-09-30",
        "min_gpa": 3.2,
        "eligible_majors": ["any", "social work", "education", "public health"],
        "requirements": "Community service log, transcript, letter of reference from community organization, personal essay.",
        "description": "Recognizes students who have made a significant positive impact on their local community through volunteer work."
    },
    {
        "name": "Women in Tech Empowerment Grant",
        "amount": "$12,000",
        "deadline": "2026-12-01",
        "min_gpa": 3.4,
        "eligible_majors": ["computer science", "information technology", "engineering"],
        "requirements": "SOP, portfolio of work, 2 recommendation letters.",
        "description": "Supports female students pursuing undergraduate degrees in computer science and technology fields."
    }
]

@mcp.tool()
def search_scholarships(query: str, gpa: float = None) -> str:
    """Search for scholarship opportunities by keyword and optional student GPA.
    
    Args:
        query: Keywords representing major, interest, or location (e.g. 'STEM', 'computer science')
        gpa: The student's current GPA (e.g. 3.6)
        
    Returns:
        A list of matching scholarships in markdown format.
    """
    print(f"Searching scholarships for query={query}, gpa={gpa}", file=sys.stderr)
    matches = []
    
    query_lower = query.lower()
    for s in SCHOLARSHIPS_DB:
        # Check keyword match
        kw_match = (
            query_lower in s["name"].lower() or
            query_lower in s["description"].lower() or
            any(query_lower in major for major in s["eligible_majors"])
        )
        
        # Check GPA match
        gpa_match = True
        if gpa is not None:
            gpa_match = gpa >= s["min_gpa"]
            
        if kw_match and gpa_match:
            matches.append(s)
            
    if not matches:
        return f"No scholarships found matching query: '{query}' with GPA: {gpa or 'N/A'}"
        
    response = "### Matching Scholarships:\n\n"
    for m in matches:
        response += (
            f"- **{m['name']}**\n"
            f"  - Amount: {m['amount']}\n"
            f"  - Deadline: {m['deadline']}\n"
            f"  - Min GPA: {m['min_gpa']}\n"
            f"  - Description: {m['description']}\n\n"
        )
    return response

@mcp.tool()
def get_scholarship_details(name: str) -> str:
    """Retrieve detailed requirements and description for a specific scholarship name.
    
    Args:
        name: The exact name of the scholarship (e.g. 'Global STEM Leaders Scholarship')
        
    Returns:
        Detailed requirements and description of the scholarship in markdown format.
    """
    print(f"Getting details for scholarship name={name}", file=sys.stderr)
    for s in SCHOLARSHIPS_DB:
        if name.lower() in s["name"].lower():
            return (
                f"### {s['name']}\n"
                f"- **Award Amount**: {s['amount']}\n"
                f"- **Application Deadline**: {s['deadline']}\n"
                f"- **Minimum GPA**: {s['min_gpa']}\n"
                f"- **Eligible Majors**: {', '.join(s['eligible_majors'])}\n"
                f"- **Description**: {s['description']}\n"
                f"- **Required Materials**: {s['requirements']}\n"
            )
            
    return f"Scholarship '{name}' not found. Please try a different query."

@mcp.tool()
def check_gpa_eligibility(gpa: float, scholarship_name: str) -> str:
    """Check if the student's GPA meets the requirement for a specific scholarship.
    
    Args:
        gpa: The student's current GPA (e.g. 3.4)
        scholarship_name: The name of the scholarship (e.g. 'Global STEM Leaders Scholarship')
        
    Returns:
        Eligibility verification status string.
    """
    print(f"Checking GPA eligibility: gpa={gpa}, scholarship={scholarship_name}", file=sys.stderr)
    for s in SCHOLARSHIPS_DB:
        if scholarship_name.lower() in s["name"].lower():
            min_gpa = s["min_gpa"]
            if gpa >= min_gpa:
                return f"✅ Eligible! Student GPA {gpa} meets the minimum requirement of {min_gpa} for '{s['name']}'."
            else:
                diff = round(min_gpa - gpa, 2)
                return f"❌ Ineligible. Student GPA {gpa} is below the minimum requirement of {min_gpa} for '{s['name']}' (needs {diff} more)."
                
    return f"Scholarship '{scholarship_name}' not found."

if __name__ == "__main__":
    mcp.run()
