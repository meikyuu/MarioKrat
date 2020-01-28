from django.urls import path

from channels.routing import ProtocolTypeRouter, URLRouter

from mariokrat.consumers import TournamentConsumer


application = ProtocolTypeRouter({
    'websocket': URLRouter([
        path('api/tournament/<token>/', TournamentConsumer),
    ]),
})
