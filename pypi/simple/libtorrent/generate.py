from urllib import request
from http.client import HTTPResponse
from json import loads

url = "https://api.github.com/repos/arvidn/libtorrent/releases/312046917/assets"
response: HTTPResponse = request.urlopen(url)
response_json = loads(response.read())

HEADER = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="pypi:repository-version" content="1.4">
<meta name="pypi:project-status" content="active">    <title>Links for libtorrent</title>
  </head>
  <body>
    <h1>Links for libtorrent</h1>"""
FOOTER = """</body>
</html>"""

with open("index.html", "w") as f:
    f.write(HEADER)
    for asset in response_json:
        if asset["name"].endswith(".whl"):
            f.write(f"""<a href="{asset['browser_download_url']}">{asset['name']}</a><br />""")
    f.write(FOOTER)
