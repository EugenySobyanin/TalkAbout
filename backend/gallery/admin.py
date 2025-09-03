from django.contrib import admin

from gallery.models import (
    Film,
    Type,
    Genre,
    Country,
    Network,
    FilmGenre,
    FilmCountry,
    FilmNetwork,
    Person,
    Profession,
    FilmPerson,
    FilmPersonProfession,
    Video,
    Fact,
    Fees,
    AgregatorInfo,
    SequelsAndPrequels,
    SimilarFilms,

)

admin.site.register(Film)
admin.site.register(Type)
admin.site.register(Genre)
admin.site.register(Country)
admin.site.register(Network)
admin.site.register(FilmGenre)
admin.site.register(FilmCountry)
admin.site.register(FilmNetwork)
admin.site.register(Person)
admin.site.register(Profession)
admin.site.register(FilmPerson)
admin.site.register(FilmPersonProfession)
admin.site.register(Video)
admin.site.register(Fact)
admin.site.register(Fees)
admin.site.register(AgregatorInfo)
admin.site.register(SequelsAndPrequels)
admin.site.register(SimilarFilms)
