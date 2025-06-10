import glob
import json
import io
import pip
import sys
import os

dependencies = {}
IO = io.StringIO

class Dependency:
    """A container to manage printing and tracking a dependency"""
    def __init__(self, name, version, dtype):
        self.name = name.rstrip()
        self.dtype = dtype.rstrip()
        self.version = version.rstrip()
        self.homepage = ""
        self.license = ""

    @staticmethod
    def csv_header():
        """We intentionally suppress the version in this output since we are sharing it externally"""
        return '"Type","Component","Home Page","License"'

    def to_csv_row(self):
        return '"{}","{}","{}","{}"'.format(
            self.dtype,
            self.name,
            self.homepage,
            self.license)

def process_javascript_dependencies(file):
    with open(file) as file_data:
        data = json.load(file_data)

        for name in data['dependencies']:
            d = Dependency(name, data['dependencies'][name], "javascript")
            homepage, license = get_yarn_info(name)
            d.homepage = homepage
            d.license = license

            dependencies[name] = d


def process_python_dependencies(file):
    with open(file) as file_data:
        for line in file_data:
            if "==" in line:
                name, version = line.split("==")
                d = Dependency(name, version, "python")
                homepage, license = get_pip_info(name)
                d.homepage = homepage
                d.license = license
                dependencies[name] = d

def get_yarn_info(name):
    file = os.popen("yarn info {} --json".format(name))
    data = json.load(file)

    homepage = data.get("data", {}).get("homepage", "")
    license = data.get("data", {}).get("license", "")

    return homepage, license


def get_pip_info(name):
    stdout = IO()
    sys.stdout = stdout
    pip.main(['show', name])
    sys.stdout = sys.__stdout__
    lines = stdout.getvalue().splitlines()

    homepage = ""
    license = ""

    for line in lines:
        if line.startswith('Home-page: '):
            homepage = line.split(": ", 1)[1]

        if line.startswith('License: '):
            license = line.split(" ", 1)[1]

    return homepage, license


# Find javascript open source dependencies
for file in glob.glob('**/package.json', recursive=True):
    if 'node_modules' in file:
        continue
    process_javascript_dependencies(file)

# Find python open source dependencies
for file in glob.glob('**/requirements*.*', recursive=True):
    if 'venv' in file:
        continue
    process_python_dependencies(file)


print(Dependency.csv_header())
for name in dependencies:
    dependency = dependencies[name]
    print(dependency.to_csv_row())