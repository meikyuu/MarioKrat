from django.db import models


class Race(models.Model):

    game = models.ForeignKey(
        'Game', on_delete=models.CASCADE,
        related_name='races',
    )
    cup = models.IntegerField()
    race = models.IntegerField()
