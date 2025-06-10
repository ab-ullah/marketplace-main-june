from copy import deepcopy


def get_from_dictionary_using_dot(data, key_with_dots):
    fetched_data = deepcopy(data)
    for _key in key_with_dots.split('.'):
        if not (fetched_data and isinstance(fetched_data, dict)):
            return None
        fetched_data = fetched_data.get(_key)

    return fetched_data
