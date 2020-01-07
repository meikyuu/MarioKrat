import math
import random
from collections import deque, defaultdict
from itertools import cycle

from .models import Game, Slot


def get_next_name(name):
    # If the name is the last available for its length return the first
    # available name that is one character longer
    if all(char == 'Z' for char in name):
        return 'A' * (len(name) + 1)

    # Convert name from letters to a number
    num = 0
    for char in name:
        num = num * 26 + ord(char) - ord('A')

    num += 1

    # Convert number back to letters
    next_name = ''
    for _ in range(len(name)):
        num, char_code = divmod(num, 26)
        next_name = chr(char_code + ord('A')) + next_name

    return next_name


def schedule(tournament, shuffle=True):
    next_name = 'A'
    next_rank = 1

    players = list(tournament.players.all())

    if shuffle:
        random.shuffle(players)

    to_schedule = deque([[
        Slot.objects.create(tournament=tournament, player=player)
        for player in players
    ]])

    while to_schedule:
        slots = to_schedule.popleft()

        # Create games
        games = []
        for _ in range(math.ceil(len(slots) / 4)):
            games.append(Game.objects.create(
                tournament=tournament,
                name=next_name,
            ))
            next_name = get_next_name(next_name)

        # Add participants to games
        for game, slot in zip(cycle(games), slots):
            slot.target = game
            slot.save()

        # Add results to games
        if len(games) == 1:
            # Final game so we divide ranks here
            game = games[0]
            for pos in range(1, game.participants.count() + 1):
                Slot.objects.create(
                    tournament=tournament,
                    source=game,
                    position=pos,
                    rank=next_rank,
                )
                next_rank += 1
        else:
            # We group the new slots by rank
            new_slots = defaultdict(list)
            for game in games:
                for pos in range(1, game.participants.count() + 1):
                    new_slots[pos].append(Slot.objects.create(
                        tournament=tournament,
                        source=game,
                        position=pos,
                    ))
            # Schedule all the 1st and 2nd together
            to_schedule.append(new_slots[1] + new_slots[2])
            # Schedule all the 3rd and 4th together
            to_schedule.append(new_slots[3] + new_slots[4])
