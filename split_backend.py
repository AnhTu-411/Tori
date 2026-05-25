import os

server_file = r"e:\Project\Cong nghe web\Tori\Tori\server.js"
with open(server_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

def get_lines(start_idx, end_idx):
    return "".join(lines[start_idx:end_idx])

# Create the route files by extracting lines
routes_dir = r"e:\Project\Cong nghe web\Tori\Tori\backend\routes"

# We will just write a new server.js and the routes from scratch
