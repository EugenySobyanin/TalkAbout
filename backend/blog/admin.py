from django.contrib import admin

from .models import PhotoPost, PhotoUser, Post, Follow, CommentPost


admin.site.register(PhotoPost)
admin.site.register(PhotoUser)
admin.site.register(Post)
admin.site.register(Follow)
admin.site.register(CommentPost)
