from django.contrib import admin

from activities.models import (
    UserFilmActivitie,
    HistoryWatching,
    Collection,
    CollectionFilms,
    Review,
    CommentReview
)


admin.site.register(UserFilmActivitie)
admin.site.register(HistoryWatching)
admin.site.register(Collection)
admin.site.register(CollectionFilms)
admin.site.register(Review)
admin.site.register(CommentReview)
