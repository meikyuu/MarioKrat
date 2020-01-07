import secrets

from django.db import models


def get_token():
    return secrets.token_hex(16)


class Tournament(models.Model):

    name = models.TextField()
    admin_token = models.TextField(default=get_token)
    spectator_token = models.TextField(default=get_token)
