from dotenv import load_dotenv
import os
load_dotenv()
from google import genai
client = genai.Client()
models = client.models.list()
for m in models:
    if 'flash' in m.name:
        print(f"Model: {m.name}")
