import secrets

from django.db import models


def get_token():
    return secrets.token_hex(16)


class Tournament(models.Model):

    name = models.TextField()
    admin_token = models.TextField(default=get_token)
    spectator_token = models.TextField(default=get_token)

    # TODO: these should probably be configurable
    game_size = 4
    game_cups = 2
    game_races = 4
