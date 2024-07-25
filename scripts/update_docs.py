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

    for file_name in yaml_files:
        category = file_name[:-5]  # Strip off '.yaml'
        yaml_content = fetch_yaml_content(file_name)
        md_file_path = os.path.join(docs_directory, f'{category}.md')

        # Read existing content and update only the YAML section
        if os.path.exists(md_file_path):
            with open(md_file_path, 'r') as file:
                lines = file.readlines()
            
            # Find the separator and preserve content before it
            try:
                index = lines.index("---\n", 2)  # Find the second occurrence of '---\n'
                pre_yaml_content = lines[:index + 1]
            except ValueError:
                pre_yaml_content = lines  # If not found, preserve all as is

            # Write updated content
            with open(md_file_path, 'w') as file:
                file.writelines(pre_yaml_content)
                file.write("```yaml\n")
                file.write(yaml_content)
                file.write("\n```\n")
        else:
            # File doesn't exist, create new with full headers
            with open(md_file_path, 'w') as file:
                file.write("---\n")
                file.write(f"layout: default\n")
                file.write(f"title: {category.capitalize()}\n")
                file.write(f"parent: Categories\n")
                file.write(f"grand_parent: Framework\n")
                file.write("---\n\n")
                file.write("---\n")
                file.write("```yaml\n")
                file.write(yaml_content)
                file.write("\n```\n")

        print(f"Updated documentation for {category}")

if __name__ == "__main__":
    update_docs()
