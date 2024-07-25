import os
import requests

def fetch_yaml_files():
    repo_api_url = "https://api.github.com/repos/OnlyWorlds/OnlyWorlds/contents/schema"
    response = requests.get(repo_api_url)
    files = [file['name'] for file in response.json() if file['name'].endswith('.yaml') and file['name'] != 'core.yaml']
    return files

def fetch_yaml_content(file_name):
    url = f"https://raw.githubusercontent.com/OnlyWorlds/OnlyWorlds/main/schema/{file_name}"
    response = requests.get(url)
    return response.text

def update_docs():
    yaml_files = fetch_yaml_files()
    script_directory = os.path.dirname(__file__)
    docs_directory = os.path.join(script_directory, '..', 'docs', 'framework', 'categories')

    # Ensure the docs directory exists
    os.makedirs(docs_directory, exist_ok=True)

    for file_name in yaml_files:
        category = file_name[:-5]  # Strip off '.yaml'
        yaml_content = fetch_yaml_content(file_name)
        md_file_path = os.path.join(docs_directory, f'{category}.md')

        with open(md_file_path, 'w') as md_file:
            md_file.write("---\n")
            md_file.write(f"title: {category.capitalize()}\n")
            md_file.write("layout: default\n")
            md_file.write("---\n")
            md_file.write("```yaml\n")
            md_file.write(yaml_content)
            md_file.write("\n```\n")

        print(f"Updated documentation for {category}")

if __name__ == "__main__":
    update_docs()
