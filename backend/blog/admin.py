from django.contrib import admin

from .models import PhotoPost, PhotoUser, Post


admin.site.register(PhotoPost)
admin.site.register(PhotoUser)
admin.site.register(Post)