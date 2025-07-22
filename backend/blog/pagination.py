from rest_framework.pagination import PageNumberPagination


class CustomPagination(PageNumberPagination):
    """Какстоманя пагинация.

    Передавать кол-во элементов на странице, можно в query параметре.
    """

    page_size_query_param = 'limit'
    page_size = 50
