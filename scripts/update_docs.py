import os
import requests
import yaml

def fetch_yaml_files():
    repo_api_url = "https://api.github.com/repos/OnlyWorlds/OnlyWorlds/contents/schema"
    response = requests.get(repo_api_url)
    files = [file['name'] for file in response.json() if file['name'].endswith('.yaml') and file['name'] != 'core.yaml']
    return files

def fetch_yaml_content(file_name):
    url = f"https://raw.githubusercontent.com/OnlyWorlds/OnlyWorlds/main/schema/{file_name}"
    response = requests.get(url)
    return response.text

def format_attribute_name(name):
    return name.capitalize()

def type_formatter(type_info, sub_value):
    formatted_type = ""
    if type_info == "string":
        formatted_type = ""
    elif type_info == "integer":
        max_val = sub_value.get('maximum')
        if max_val is not None and max_val != 0:
            formatted_type = f" (# max:{max_val})"
        else:
            formatted_type = " (#)"
    elif type_info == "multi-link":
        category = sub_value.get('category', 'unknown')
        formatted_type = f" (multi-link: {category})"
    elif type_info == "single-link":
        category = sub_value.get('category', 'unknown')
        formatted_type = f" (single-link: {category})"
    return formatted_type


def convert_yaml_to_markdown(yaml_content):
    data = yaml.safe_load(yaml_content)
    markdown_output = []
    
    # Iterate through each main group in properties to create sections
    for key, value in data.get('properties', {}).items():
        markdown_output.append(f"### {key.capitalize()}\n")
        
        # Iterate through each sub-property
        if 'properties' in value:
            for sub_key, sub_value in value['properties'].items():
                description = sub_value.get('description', 'No description available.')
                type_info = sub_value.get('type', 'N/A')
                formatted_type = type_formatter(type_info, sub_value)
                markdown_output.append(f"- **{format_attribute_name(sub_key)}**{formatted_type}: {description}\n")
        markdown_output.append("\n")  # Add a newline for spacing

    return "".join(markdown_output)

def update_docs():
    yaml_files = fetch_yaml_files()
    script_directory = os.path.dirname(__file__)
    docs_directory = os.path.join(script_directory, '..', 'docs', 'specification', 'element_categories')

    for file_name in yaml_files:
        category = file_name[:-5]  # Strip off '.yaml'
        yaml_content = fetch_yaml_content(file_name)
        markdown_content = convert_yaml_to_markdown(yaml_content)
        md_file_path = os.path.join(docs_directory, f'{category}.md')

        # Read existing content and update only the YAML section
        if os.path.exists(md_file_path):
            with open(md_file_path, 'r') as file:
                content = file.read()
            
            # Find the third occurrence of '---'
            parts = content.split("---", 3)
            if len(parts) > 3:
                pre_yaml_content = "---".join(parts[:3]) + "---\n"
            else:
                pre_yaml_content = content  # If not found, preserve all as is

            # Write updated content
            with open(md_file_path, 'w') as file:
                file.write(pre_yaml_content)
                file.write(markdown_content)
        else:
            # File doesn't exist, create new with full headers and base text
            with open(md_file_path, 'w') as file:
                file.write("---\n")
                file.write("layout: default\n")
                file.write(f"title: {category.capitalize()}\n")
                file.write("parent: Element Categories\n")
                file.write("grand_parent: Specification\n")
                file.write("---\n")
                file.write("Base Text\n")
                file.write("---\n")
                file.write(markdown_content)

        print(f"Updated documentation for {category}")

if __name__ == "__main__":
    update_docs()
