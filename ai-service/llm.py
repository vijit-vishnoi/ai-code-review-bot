import os
import json
from groq import Groq

# Initialize the client. 
# It will automatically pick up GROQ_API_KEY from the environment if present.
client = Groq()

system_instruction = """
You are an expert AI code reviewer. Analyze the provided code.
Categorize issues into bugs, style problems, and security concerns.
Provide an overall summary and a score out of 100.
You must return your response strictly as a JSON object matching this schema:
{
  "bugs": [{"line": "int (optional)", "description": "str", "suggestion": "str"}],
  "style": [{"line": "int (optional)", "description": "str", "suggestion": "str"}],
  "security": [{"line": "int (optional)", "description": "str", "suggestion": "str"}],
  "summary": "str",
  "score": "int"
}
"""

def get_review_stream(code: str, language: str):
    prompt = f"Language: {language}\n\nCode to review:\n{code}"
    
    try:
        # Use Groq's fast Llama 3 model with JSON mode and streaming
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            response_format={"type": "json_object"}
        )
        
        # Yield Server-Sent Events (SSE) format
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                safe_chunk = content.replace('\n', '')
                yield f"data: {safe_chunk}\n\n"
                
    except Exception as e:
        error_json = json.dumps({"error": f"AI Service Unavailable: {str(e)}"})
        yield f"data: {error_json}\n\n"
        
    yield "data: [DONE]\n\n"
