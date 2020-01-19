from django.db.models import Q
from django.http import JsonResponse

from main.views import not_found_view
from utils.views import allow_methods, validate_body
from ..models import Tournament, Player
from ..schedule import schedule

from is_valid import is_str, is_list_of, is_pre, is_not_blank


POINTS = {
    1: 15,
    2: 12,
    3: 10,
    4: 8,
    5: 7,
    6: 6,
    7: 5,
    8: 4,
    9: 3,
    10: 2,
    11: 1,
    12: 0,
}


def add_ranks(scores, allow_equal=True):
    scores.sort(key=lambda score: score['points'])
    for i, score in enumerate(scores):
        while (
            allow_equal and
            i > 0 and
            score['points'] == scores[i - 1]['points']
        ):
            i -= 1
        score['rank'] = i + 1


def tournament_data(tournament, include_admin_token=False):
    next_race = None
    games = []

    for game in tournament.games.order_by('name'):
        players = list(game.players_in.order_by('position', 'id'))

        game_done = True
        active = all(slot.player is not None for slot in players)
        cups = []
        total = [{'player': i, 'points': 0} for i in range(len(players))]

        for i, cup in enumerate(game.cups.order_by('number')):
            cup_done = True
            scores = [
                {'player': i, 'races': [], 'points': 0}
                for i in range(len(players))
            ]
            for j, race in enumerate(cup.races.order_by('number')):
                for score in scores:
                    score['races'].append(None)
                for result in race.results.all():
                    player = players.index(result.slot)
                    scores[player]['races'][-1] = POINTS[result.position]
                    scores[player]['points'] += POINTS[result.position]
                if any(score['races'][-1] is None for score in scores):
                    game_done = False
                    cup_done = False
                    if active and (next_race is None or i < next_race['cup']):
                        next_race = {
                            'game': game.name,
                            'cup': i,
                            'race': j,
                        }
            # If there is only one cup we do not allow ending on the same
            # position because we need clear rankings from that cup, otherwise
            # this is handled in the total rank
            add_ranks(scores, game.cups.count() != 1)
            cups.append(scores)

            if cup_done:
                for score in scores:
                    total[score['player']]['points'] += (
                        (len(players) - score['rank']) *
                        (POINTS[1] * cup.races.count()) +
                        score['points']
                    )

        add_ranks(total, False)

        games.append({
            'name': game.name,
            'state': (
                'done' if game_done else 'active' if active else 'waiting'
            ),
            'players': [
                {
                    'type': 'slot',
                    'game': slot.source.name,
                    'position': slot.position,
                    'player': slot.player and slot.player.number,
                }
                if slot.source else
                {
                    'type': 'player',
                    'player': slot.player.number,
                }
                for slot in players
            ],
            'cups': cups,
            'total': total,
        })

    data = {
        'token': tournament.spectator_token,
        'name': tournament.name,
        'players': [
            {
                'id': player.number,
                'name': player.name,
            }
            for player in tournament.players.order_by('number')
        ],
        'games': games,
        'ranks': [
            {
                'rank': slot.rank,
                'game': slot.source.name,
                'position': slot.position,
                'player': slot.player and slot.player.number,
            }
            for slot in tournament.slots.exclude(rank=None).order_by('rank')
        ],
        'next_race': next_race,
    }
    if include_admin_token:
        data['admin_token'] = tournament.admin_token
    return data


def tournament_view(request, token=None):
    if token is None:
        return tournament_list(request)
    else:
        return tournament_detail(request, token)


@allow_methods('POST')
@validate_body({
    'name': is_pre(is_str, is_not_blank),
    'players': is_list_of({
        'name': is_pre(is_str, is_not_blank),
    }),
})
def tournament_list(request, data):
    tournament = Tournament.objects.create(name=data['name'])
    for n, player_data in enumerate(data['players'], 1):
        Player.objects.create(
            tournament=tournament,
            number=n,
            name=player_data['name'],
        )

    schedule(tournament)

    return JsonResponse(tournament_data(tournament, True))


@allow_methods('GET')
def tournament_detail(request, token):
    try:
        tournament = Tournament.objects.get(
            Q(admin_token=token) |
            Q(spectator_token=token)
        )
    except Tournament.DoesNotExist:
        return not_found_view(request)

    is_admin = token == tournament.admin_token

    return JsonResponse(tournament_data(tournament, is_admin))
