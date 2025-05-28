from django.contrib import admin

from .models import PhotoPost, PhotoUser, Post, Follow


admin.site.register(PhotoPost)
admin.site.register(PhotoUser)
admin.site.register(Post)
admin.site.register(Follow)