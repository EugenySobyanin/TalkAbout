from django.contrib import admin

from activities.models import (
    UserFilmActivitie,
    HistoryWatching,
    Review,
    CommentReview
)


admin.site.register(UserFilmActivitie)
admin.site.register(HistoryWatching)
admin.site.register(Review)
admin.site.register(CommentReview)
