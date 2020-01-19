from django.db import models


class Race(models.Model):

    cup = models.ForeignKey(
        'Cup', on_delete=models.CASCADE,
        related_name='races',
    )
    number = models.IntegerField()
