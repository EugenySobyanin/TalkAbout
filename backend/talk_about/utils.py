import os

from django.core.files.storage import default_storage


def delete_folder_with_all_files(folder_path):
    """Удаление папки и всех файлов в ней."""
    # Полный физический путь к папке
    full_path = default_storage.path(folder_path)

    if default_storage.exists(folder_path):
        # Удаляем все содержимое папки рекурсивно
        for root, dirs, files in os.walk(full_path, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))

        # Удаляем саму папку
        os.rmdir(full_path)
