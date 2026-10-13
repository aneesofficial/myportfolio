import sys
try:
    from bs4 import BeautifulSoup
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "beautifulsoup4"])
    from bs4 import BeautifulSoup

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

# We want to keep f4 (Certifications).
# We want to remove b4 (Empty).
# We want to move f5 -> b4
# We want to move b5 -> f5
# We want to move f6 -> b5
# ...
# We want to remove f8 (Quote).
# We want to move b8 -> b7

# Get all faces
f4 = soup.find(id="f4")
b4 = soup.find(id="b4")
f5 = soup.find(id="f5")
b5 = soup.find(id="b5")
f6 = soup.find(id="f6")
b6 = soup.find(id="b6")
f7 = soup.find(id="f7")
b7 = soup.find(id="b7")
f8 = soup.find(id="f8")
b8 = soup.find(id="b8")

# Extract the inner contents (the children of the front-content / back-content divs)
def get_inner_html(tag):
    return "".join(str(c) for c in tag.contents)

f5_inner = get_inner_html(f5)
b5_inner = get_inner_html(b5)
f6_inner = get_inner_html(f6)
b6_inner = get_inner_html(b6)
f7_inner = get_inner_html(f7)
b7_inner = get_inner_html(b7)
b8_inner = get_inner_html(b8)

# Now assign them backwards
b4.clear()
b4.append(BeautifulSoup(f5_inner, "html.parser"))

f5.clear()
f5.append(BeautifulSoup(b5_inner, "html.parser"))

b5.clear()
b5.append(BeautifulSoup(f6_inner, "html.parser"))

f6.clear()
f6.append(BeautifulSoup(b6_inner, "html.parser"))

b6.clear()
b6.append(BeautifulSoup(f7_inner, "html.parser"))

f7.clear()
f7.append(BeautifulSoup(b7_inner, "html.parser"))

b7.clear()
b7.append(BeautifulSoup(b8_inner, "html.parser"))

# Add back-cover class to b7
b7['class'] = b7.get('class', []) + ['back-cover']

# Remove p8 entirely
p8 = soup.find(id="p8")
p8.decompose()

# Update script js numOfPapers? The script uses document.querySelectorAll(".paper").length, so it's automatic!
# We just need to save the html.
with open("index.html", "w", encoding="utf-8") as f:
    f.write(str(soup))

print("DOM updated successfully via BeautifulSoup!")
