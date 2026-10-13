import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Define the precise blocks based on manual extraction to avoid regex parsing issues on nested divs
# We know f4 starts at <div id="f4" and ends right before <div class="back"> in p4
# We will just parse the file based on the <div class="paper" id="pX"> markers

def get_paper_content(p_id):
    start_str = f'<div class="paper" id="{p_id}">'
    if start_str not in html:
        return None
    start_idx = html.find(start_str)
    
    # find next paper or end of book
    next_p_num = int(p_id[1:]) + 1
    next_str = f'<div class="paper" id="p{next_p_num}">'
    if next_str in html:
        end_idx = html.find(next_str)
    else:
        end_idx = html.find('<!-- Book Controls')
    
    return html[start_idx:end_idx]

p4 = get_paper_content('p4')
p5 = get_paper_content('p5')
p6 = get_paper_content('p6')
p7 = get_paper_content('p7')
p8 = get_paper_content('p8')

# Now extract front and back from a paper string
def extract_face(paper_html, face_id):
    # Extracts the content of <div id="fX" class="front-content..."> ... </div>
    # by finding <div id="fX" and then balancing the divs.
    start_marker = f'<div id="{face_id}"'
    start_idx = paper_html.find(start_marker)
    if start_idx == -1:
        return ""
        
    # Find the closing >
    content_start = paper_html.find('>', start_idx) + 1
    
    # To avoid writing a full HTML parser, let's just use string splits because we know the structure
    # The face content is everything inside <div id="face_id" class="..."> ... </div>
    # The end of the face content is right before the </div> that closes the face div.
    # Since we know the next line is </div> \n </div> (for the front/back wrapper)
    # This is fragile, let's use regex with DOTALL, knowing it ends right before </div>\n          </div>
    
    m = re.search(f'<div id="{face_id}" class="[^"]*">(.*?)</div>\s*</div>', paper_html, re.DOTALL)
    if m:
        return m.group(1).strip()
    return ""

f4_content = extract_face(p4, 'f4')
# b4 is currently blank/ribbon, we discard it
f5_content = extract_face(p5, 'f5') # Projects 1
b5_content = extract_face(p5, 'b5') # Projects 2
f6_content = extract_face(p6, 'f6') # Projects 3
b6_content = extract_face(p6, 'b6') # Get In Touch
f7_content = extract_face(p7, 'f7') # Contact Me
b7_content = extract_face(p7, 'b7') # Available for Opp
# f8 is Quote, we discard it
b8_content = extract_face(p8, 'b8') # Back Cover

# Now construct the new papers
new_p4 = f"""        <!-- SPREAD 3 (Right) / SPREAD 4 (Left) -->
        <div class="paper" id="p4">
          <div class="front">
            <div id="f4" class="front-content">
{f4_content}
            </div>
          </div>
          <div class="back">
            <div id="b4" class="back-content">
{f5_content}
            </div>
          </div>
        </div>
"""

new_p5 = f"""
        <!-- SPREAD 4 (Right) / SPREAD 5 (Left) -->
        <div class="paper" id="p5">
          <div class="front">
            <div id="f5" class="front-content">
{b5_content}
            </div>
          </div>
          <div class="back">
            <div id="b5" class="back-content">
{f6_content}
            </div>
          </div>
        </div>
"""

new_p6 = f"""
        <!-- SPREAD 5 (Right) / SPREAD 6 (Left) -->
        <div class="paper" id="p6">
          <div class="front">
            <div id="f6" class="front-content">
{b6_content}
            </div>
          </div>
          <div class="back">
            <div id="b6" class="back-content">
{f7_content}
            </div>
          </div>
        </div>
"""

new_p7 = f"""
        <!-- SPREAD 6 (Right) / BACK COVER -->
        <div class="paper" id="p7">
          <div class="front">
            <div id="f7" class="front-content">
{b7_content}
            </div>
          </div>
          <div class="back">
            <div id="b7" class="back-content back-cover">
{b8_content}
            </div>
          </div>
        </div>
"""

# Replace in html
start_idx = html.find('<div class="paper" id="p4">')
# Include the comment above it
start_idx = html.rfind('<!-- SPREAD 3 (Right)', 0, start_idx)

end_idx = html.find('<!-- Book Controls')

new_html = html[:start_idx] + new_p4 + new_p5 + new_p6 + new_p7 + '        ' + html[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("HTML modified successfully.")
