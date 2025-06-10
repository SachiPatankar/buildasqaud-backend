import os

output_file = "all_files_with_contents.txt"

with open(output_file, "w", encoding="utf-8") as f:
    for root, dirs, files in os.walk("."):
        for file in files:
            file_path = os.path.join(root, file)
            f.write(f"--- File: {file_path} ---\n")
            try:
                with open(file_path, "r", encoding="utf-8") as infile:
                    contents = infile.read()
                    f.write(contents + "\n")
            except Exception as e:
                f.write(f"[Could not read file: {e}]\n")
            f.write("\n")  # Add spacing between files

print(f"All file paths and contents written to {output_file}")
