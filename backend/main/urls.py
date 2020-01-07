from django.urls import include, path, re_path

from mariokrat.views import tournament_view
from .views import not_found_view


urlpatterns = [
    path('tournament/', tournament_view, name='tournament-list'),
    path('tournament/<token>/', tournament_view, name='tournament-detail'),
    re_path(r'^.*$', not_found_view, name='not-found'),
]

# Wrap with api/ prefix
urlpatterns = [path('api/', include(urlpatterns))]
