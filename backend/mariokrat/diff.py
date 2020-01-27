def diff(old_data, new_data):
    """
    Very simple diffing algorithm that yields differences of (path, value) in
    nested data.

    Mainly useful for data that remains the same in terms of structure and only
    changes at it's leafs.
    """
    # No change
    if old_data == new_data:
        pass
    # Same size lists
    elif (
        isinstance(old_data, list) and
        isinstance(new_data, list) and
        len(old_data) == len(new_data)
    ):
        for index in range(len(old_data)):
            for (path, value) in diff(old_data[index], new_data[index]):
                yield ((index, *path), value)
    # Same key dicts
    elif (
        isinstance(old_data, dict) and
        isinstance(new_data, dict) and
        set(old_data) == set(new_data)
    ):
        for key in old_data:
            for (path, value) in diff(old_data[key], new_data[key]):
                yield ((key, *path), value)
    # Full change
    else:
        yield ((), new_data)
