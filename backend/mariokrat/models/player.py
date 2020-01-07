from django.db import models


class Player(models.Model):

    tournament = models.ForeignKey(
        'Tournament', on_delete=models.CASCADE,
        related_name='players',
    )
    number = models.IntegerField()
    name = models.TextField()
