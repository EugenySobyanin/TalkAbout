import os

from django.core.files.storage import default_storage

from talk_about.constants import DEFAULT_AVATAR_PATH


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


def delete_old_avatar(instance, avatar_field_name='avatar'):
    """
    Удаляет старый аватар при обновлении, если он не дефолтный.

    Args:
        instance: Экземпляр модели (обычно User)
        avatar_field_name: Имя поля с аватаром (по умолчанию 'avatar')
    """
    if not instance.pk:  # Новый объект, нечего удалять
        return

    try:
        #  Пытаемся получить объект из базы (который изменяем)
        old_instance = instance.__class__.objects.get(pk=instance.pk)
    except instance.__class_.DoesNotExist:
        return

    old_avatar = getattr(old_instance, avatar_field_name)
    new_avatar = getattr(instance, avatar_field_name)

    if (
        old_avatar and
        old_avatar != new_avatar and
        old_avatar.name != DEFAULT_AVATAR_PATH
    ):
        default_storage.delete(old_avatar.path)
