from django.contrib import admin

from activities.models import (
    UserFilmActivity,
    HistoryWatching,
    Review,
    CommentReview
)


admin.site.register(UserFilmActivity)
admin.site.register(HistoryWatching)
admin.site.register(Review)
admin.site.register(CommentReview)
