import json

from django.db.models import Q

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from ..models import Tournament


class TournamentConsumer(WebsocketConsumer):

    def connect(self):
        token = self.scope['url_route']['kwargs']['token']

        try:
            tournament = Tournament.objects.get(
                Q(admin_token=token) |
                Q(spectator_token=token)
            )
        except Tournament.DoesNotExist:
            self.close()
            return

        self.tournament_group_name = f'tournament-{tournament.id}'

        async_to_sync(self.channel_layer.group_add)(
            self.tournament_group_name,
            self.channel_name,
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.tournament_group_name,
            self.channel_name,
        )

    def tournament_changes(self, event):
        print('RECEIVED CHANGES', event)
        self.send(text_data=json.dumps(event['changes']))
