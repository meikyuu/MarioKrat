from django.db import models


class Cup(models.Model):

    game = models.ForeignKey(
        'Game', on_delete=models.CASCADE,
        related_name='cups',
    )
    number = models.IntegerField()
