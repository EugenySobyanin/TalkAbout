import os

from django.core.files.storage import default_storage


# Функция работала при удалении пользователя и не работала при удалении поста
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


# Альтернативный вариант (возможно вообще не рабочий, надо тестить)
# def delete_folder_with_all_files(folder_path):
#     """Удаляет папку и все содержимое через Storage API"""
#     if not default_storage.exists(folder_path):
#         return

#     # Удаляем все файлы в папке
#     dirs, files = default_storage.listdir(folder_path)
#     for file in files:
#         default_storage.delete(f"{folder_path}/{file}")
    
#     # Рекурсивно удаляем подпапки
#     for sub_dir in dirs:
#         delete_folder_with_all_files(f"{folder_path}/{sub_dir}")
    
#     # Удаляем саму папку (если storage поддерживает)
#     try:
#         default_storage.delete(folder_path)
#     except NotImplementedError:
#         # Некоторые storage (например S3) не поддерживают удаление пустых папок
#         pass