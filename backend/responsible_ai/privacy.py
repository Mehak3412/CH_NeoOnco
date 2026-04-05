import os

def anonymize_and_cleanup(file_paths: list):
    """
    Ensures that temporary uploads (images or data) are deleted
    from the server after inference to maintain patient privacy.
    """
    deleted_files = []
    failed_to_delete = []

    for path in file_paths:
        if os.path.exists(path):
            try:
                os.remove(path)
                deleted_files.append(path)
            except Exception as e:
                print(f"Privacy Warning: Failed to delete file {path}. Error: {e}")
                failed_to_delete.append(path)

    return {
        "status": "success" if not failed_to_delete else "warning",
        "deleted_count": len(deleted_files),
        "failed_count": len(failed_to_delete)
    }
