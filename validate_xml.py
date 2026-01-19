import os
import lxml.etree as etree

def validate_xml_files(directory):
    errors = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.xml'):
                file_path = os.path.join(root, file)
                try:
                    etree.parse(file_path)
                    print(f"OK: {file_path}")
                except etree.XMLSyntaxError as e:
                    errors.append(f"ERROR in {file_path}: {e}")
    return errors

if __name__ == "__main__":
    project_dir = "/home/lfcamara/Proyectos/website_tecnosoft/website_tecnosoft"
    syntax_errors = validate_xml_files(project_dir)
    if syntax_errors:
        print("\n".join(syntax_errors))
        exit(1)
    else:
        print("\nAll XML files are valid.")
        exit(0)
