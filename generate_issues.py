import requests
import json
from marko.ext.gfm import gfm
from bs4 import BeautifulSoup

def download_markdown(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Failed to download the file. Status code: {response.status_code}")
        return None

def table_to_json(table):
    headers = [cell.children[0] for cell in table.children[0].children]
    rows = [
        {headers[i]: cell.children[0] for i, cell in enumerate(row.children)}
        for row in table.children[1:]
    ]
    return rows

def extract_table(markdown_content):
    document = gfm(markdown_content)
    soup = BeautifulSoup(document, 'html.parser')
    table = soup.find('table')
    headers = [header.text.strip() for header in table.find_all('th')]
    rows = []
    for row in table.find_all('tr')[1:]:  # Skipping the header row
        columns = row.find_all('td')
        if columns:
            row_data = [column.text.strip() for column in columns]
            rows.append(row_data)

    data = [dict(zip(headers, row)) for row in rows]

    return data

url = 'https://raw.githubusercontent.com/MicrosoftDocs/sql-docs/refs/heads/live/data-migration/sql-server/managed-instance/assessment-rules.md'  # Replace with the actual URL
markdown_content = download_markdown(url)
if markdown_content:
    dbmi_data = extract_table(markdown_content)

url = 'https://raw.githubusercontent.com/MicrosoftDocs/sql-docs/refs/heads/live/data-migration/sql-server/database/assessment-rules.md'

markdown_content = download_markdown(url)
if markdown_content:
    sqldb_data = extract_table(markdown_content)

data = {
    'dbmi': dbmi_data,
    'sqldb': sqldb_data
}

with open('lib/issues.json', 'w') as json_file:
    json.dump(data, json_file, indent=4)
