from django.db import models


class Result(models.Model):

    race = models.ForeignKey(
        'Race', on_delete=models.CASCADE,
        related_name='results',
    )
    slot = models.ForeignKey(
        'Slot', on_delete=models.CASCADE,
        related_name='results',
    )
    position = models.IntegerField()
