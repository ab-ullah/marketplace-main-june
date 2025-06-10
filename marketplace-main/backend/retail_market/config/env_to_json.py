#!/usr/bin/env python
import json
import sys

def main():
    """Take an environment file and convert it to JSON."""

    if len(sys.argv) != 2:
        print("Expected a file to read")

    filename = sys.argv[1]
    config = {}
    with open(filename) as f:
        lines = f.readlines()
        for line in lines:
            line = line.strip('\n')
            tokens = line.split('=')
            if len(tokens) == 2:
                config[tokens[0]] = tokens[1]
    print(json.dumps(config))

if __name__ == '__main__':
    main()