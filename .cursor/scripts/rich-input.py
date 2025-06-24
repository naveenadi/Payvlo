# input-reader.py
import os
import re
import base64
import json
from pathlib import Path

def read_markdown_input():
    """Read and parse rich markdown input with image support."""
    prompt_file = Path("prompt.md")
    
    if not prompt_file.exists():
        create_template_prompt()
        print("📝 Created prompt.md template. Please edit it and run again.")
        return None
    
    content = prompt_file.read_text(encoding='utf-8')
    
    # Parse markdown content
    parsed_input = {
        'raw_content': content,
        'title': extract_title(content),
        'sections': extract_sections(content),
        'images': extract_images(content),
        'code_blocks': extract_code_blocks(content),
        'priority': extract_priority(content)
    }
    
    return parsed_input

def create_template_prompt():
    """Create a template prompt.md file."""
    template = """# Development Request

## Context
Describe the current project state and what you're working on...

## Request
What specifically do you want me to help with?

## Images (Optional)
![Description](data:image/png;base64,BASE64_STRING_HERE)

## Code Reference (Optional)
```language
// Relevant code here
```

## Priority
Low | Medium | High
"""
    
    with open("prompt.md", "w", encoding='utf-8') as f:
        f.write(template)

def extract_title(content):
    """Extract the main title from markdown."""
    match = re.search(r'^# (.+)$', content, re.MULTILINE)
    return match.group(1) if match else "Untitled Request"

def extract_sections(content):
    """Extract all sections with their content."""
    sections = {}
    current_section = None
    lines = content.split('\n')
    
    for line in lines:
        if line.startswith('## '):
            current_section = line[3:].strip()
            sections[current_section] = []
        elif current_section and line.strip():
            sections[current_section].append(line)
    
    return {k: '\n'.join(v) for k, v in sections.items()}

def extract_images(content):
    """Extract base64 images from markdown."""
    pattern = r'!\[([^\]]*)\]\(data:image/([^;]+);base64,([^)]+)\)'
    matches = re.findall(pattern, content)
    
    return [
        {
            'alt_text': match[0],
            'format': match[1],
            'data': match[2][:100] + '...' if len(match[2]) > 100 else match[2]  # Truncate for display
        }
        for match in matches
    ]

def extract_code_blocks(content):
    """Extract code blocks with language info."""
    pattern = r'```(\w+)?\n(.*?)\n```'
    matches = re.findall(pattern, content, re.DOTALL)
    
    return [
        {
            'language': match[0] or 'text',
            'code': match[1].strip()
        }
        for match in matches
    ]

def extract_priority(content):
    """Extract priority level from content."""
    priority_match = re.search(r'(?:Priority|priority):\s*(High|Medium|Low)', content, re.IGNORECASE)
    return priority_match.group(1) if priority_match else "Medium"

def suggest_plan_updates(parsed_input):
    """Suggest plan.md updates based on rich input."""
    suggestions = []
    
    if parsed_input['priority'] == 'High':
        suggestions.append("🔥 Move to Current Goal in plan.md")
    
    if parsed_input['code_blocks']:
        suggestions.append("💻 Add technical implementation tasks")
    
    if parsed_input['images']:
        suggestions.append("🎨 Update UI/UX requirements based on mockups")
    
    return suggestions

def save_image_from_base64(image_data, filename):
    """Save base64 image to file for processing."""
    try:
        image_bytes = base64.b64decode(image_data['data'])
        
        with open(f"temp_{filename}.{image_data['format']}", "wb") as f:
            f.write(image_bytes)
        
        return f"temp_{filename}.{image_data['format']}"
    except Exception as e:
        print(f"❌ Error saving image: {e}")
        return None

def display_parsed_content(parsed_input):
    """Display the parsed content in a structured format."""
    print("\n" + "="*60)
    print("📖 RICH MARKDOWN INPUT PARSED")
    print("="*60)
    
    print(f"\n📌 Title: {parsed_input['title']}")
    print(f"🚨 Priority: {parsed_input['priority']}")
    
    if parsed_input['sections']:
        print(f"\n📋 Sections Found: {len(parsed_input['sections'])}")
        for section_name in parsed_input['sections'].keys():
            print(f"   • {section_name}")
    
    if parsed_input['images']:
        print(f"\n🖼️  Images Found: {len(parsed_input['images'])}")
        for i, img in enumerate(parsed_input['images']):
            print(f"   • Image {i+1}: {img['alt_text']} ({img['format']})")
    
    if parsed_input['code_blocks']:
        print(f"\n💻 Code Blocks Found: {len(parsed_input['code_blocks'])}")
        for i, code in enumerate(parsed_input['code_blocks']):
            print(f"   • Block {i+1}: {code['language']} ({len(code['code'])} chars)")
    
    # Plan update suggestions
    suggestions = suggest_plan_updates(parsed_input)
    if suggestions:
        print(f"\n🎯 AURA Plan Update Suggestions:")
        for suggestion in suggestions:
            print(f"   {suggestion}")
    
    print("\n" + "="*60)
    print("Ready for AI processing! 🚀")
    print("="*60)

def archive_prompt():
    """Archive the processed prompt file."""
    from datetime import datetime
    
    if not Path("prompt.md").exists():
        return
    
    # Create archive directory if it doesn't exist
    archive_dir = Path("archive")
    archive_dir.mkdir(exist_ok=True)
    
    # Generate timestamp
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    archive_path = archive_dir / f"prompt-{timestamp}.md"
    
    # Move file to archive
    Path("prompt.md").rename(archive_path)
    print(f"📁 Archived prompt to: {archive_path}")

if __name__ == "__main__":
    result = read_markdown_input()
    
    if result:
        display_parsed_content(result)
        
        # Ask if user wants to archive the prompt
        print("\n" + "-"*60)
        archive_choice = input("Archive this prompt? (y/N): ").strip().lower()
        if archive_choice in ['y', 'yes']:
            archive_prompt()
            print("✅ Prompt archived successfully!")
        else:
            print("📝 Prompt.md left in place for further editing.")
    else:
        print("🔄 Please edit prompt.md and run again!") 