from django.db import models


class Slot(models.Model):

    tournament = models.ForeignKey(
        'Tournament', on_delete=models.CASCADE,
        related_name='slots',
    )

    source = models.ForeignKey(
        'Game', on_delete=models.PROTECT,
        blank=True, null=True,
        related_name='results',
    )
    position = models.IntegerField(blank=True, null=True)

    player = models.ForeignKey(
        'Player', on_delete=models.PROTECT,
        blank=True, null=True,
        related_name='+'
    )

    target = models.ForeignKey(
        'Game', on_delete=models.PROTECT,
        blank=True, null=True,
        related_name='participants',
    )
    rank = models.IntegerField(blank=True, null=True)
