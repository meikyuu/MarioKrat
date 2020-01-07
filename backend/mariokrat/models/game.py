
from django.db import models


class Game(models.Model):

    tournament = models.ForeignKey(
        'Tournament', on_delete=models.CASCADE,
        related_name='games',
    )
    name = models.TextField()
